import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import AppLayout from '../components/AppLayout'

const STEPS = ['Society', 'Vendor', 'Items', 'Checkout']

export default function NewOrder() {
  const { user }  = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()

  /* ── Remote data ── */
  const [societies, setSocieties] = useState([])
  const [vendors,   setVendors]   = useState([])
  const [loadingSoc, setLoadingSoc] = useState(true)
  const [loadingVen, setLoadingVen] = useState(false)

  /* ── Selections ── */
  const [selSociety, setSelSociety] = useState(null)   // full society object
  const [selVendor,  setSelVendor]  = useState(null)   // full vendor object
  const [cart,       setCart]       = useState({})     // { itemId: quantity }
  const [payMethod,  setPayMethod]  = useState('cash_on_delivery')
  const [note,       setNote]       = useState('')
  const [placing,    setPlacing]    = useState(false)

  /* ── Step ── */
  const step =
    !selSociety           ? 1 :
    !selVendor            ? 2 :
    Object.keys(cart).filter(k => cart[k] > 0).length === 0 ? 3 : 4

  /* ── Fetch societies ── */
  useEffect(() => {
    api.get('/api/v1/societies')
      .then(({ data }) => setSocieties(data.data || []))
      .catch(() => toast.error('Failed to load societies'))
      .finally(() => setLoadingSoc(false))
  }, [])

  /* ── Fetch vendors when society selected ── */
  useEffect(() => {
    if (!selSociety) return
    setLoadingVen(true)
    setSelVendor(null)
    setCart({})
    api.get('/api/v1/vendors')
      .then(({ data }) => setVendors((data.data || []).filter(v => v.isActive)))
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoadingVen(false))
  }, [selSociety])

  /* ── Cart helpers ── */
  const cartItems = selVendor?.items?.filter(i => cart[i._id] > 0) || []
  const totalAmount = cartItems.reduce((s, i) => s + i.price * (cart[i._id] || 0), 0)
  const totalQty    = cartItems.reduce((s, i) => s + (cart[i._id] || 0), 0)

  const setQty = (itemId, qty) => {
    setCart(prev => ({ ...prev, [itemId]: Math.max(0, qty) }))
  }

  /* ── Place order ── */
  const placeOrder = async () => {
    if (!selSociety || !selVendor || cartItems.length === 0) {
      toast.error('Complete all selections')
      return
    }
    setPlacing(true)
    try {
      const items = cartItems.map(i => ({ _id: i._id, quantity: cart[i._id] }))

      const { data } = await api.post('/api/v1/orders', {
        vendor:         selVendor._id,
        society:        selSociety._id,
        items,
        payment_method: payMethod,
      })

      toast.success('Order placed successfully!')

      // If online, trigger Razorpay flow
      if (payMethod === 'online' && data.data?.razorpay) {
        const rzp = data.data.razorpay
        const { data: initData } = await api.post(`/api/v1/payments/${rzp.payment_id}/razorpay/initiate`)

        const options = {
          key:      initData.data.key,
          amount:   initData.data.amount,
          currency: initData.data.currency,
          order_id: initData.data.gateway_order_id,
          name:     selVendor.name,
          prefill:  initData.data.prefill,
          handler: async (response) => {
            try {
              await api.post(`/api/v1/payments/${rzp.payment_id}/razorpay/verify`, response)
              toast.success('Payment verified!')
              navigate('/user/my-orders')
            } catch {
              toast.error('Payment verification failed')
            }
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled. Order placed but unpaid.')
              navigate('/user/my-orders')
            }
          }
        }
        new window.Razorpay(options).open()
      } else {
        navigate('/user/my-orders')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <AppLayout>

      {/* ── Step progress bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto' }}>
        {STEPS.map((label, i) => {
          const n      = i + 1
          const done   = step > n
          const active = step === n
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? 'var(--green)' : active ? 'var(--ember)' : 'var(--bg-overlay)',
                  border: `2px solid ${done ? 'var(--green)' : active ? 'var(--ember)' : 'var(--border-dim)'}`,
                  color:  done || active ? '#000' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, transition: 'all 0.3s',
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  color: active ? 'var(--text-primary)' : done ? 'var(--green)' : 'var(--text-muted)',
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 32, height: 1, margin: '0 8px',
                  background: done ? 'var(--green)' : 'var(--border-dim)',
                  transition: 'all 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid-60-40">

        {/* ── LEFT: Selection panels ── */}
        <div>

          {/* STEP 1 — Society */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-header">
              <div className="panel-title">🏢 Select Society</div>
              {selSociety && (
                <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => { setSelSociety(null); setSelVendor(null); setCart({}) }}>
                  Change
                </button>
              )}
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingSoc ? (
                <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>Loading societies...</div>
              ) : societies.map(s => (
                <button
                  key={s._id}
                  onClick={() => setSelSociety(s)}
                  style={{
                    background:   selSociety?._id === s._id ? 'var(--ember-glow)' : 'var(--bg-overlay)',
                    border:       `1.5px solid ${selSociety?._id === s._id ? 'var(--ember)' : 'var(--border-dim)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding:      '12px 16px', cursor: 'pointer',
                    textAlign:    'left', transition: 'all 0.15s',
                    display:      'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selSociety?._id === s._id ? 'var(--ember-bright)' : 'var(--text-primary)' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      📍 {s.address?.area}, {s.address?.city}
                    </div>
                  </div>
                  {selSociety?._id === s._id && <span style={{ color: 'var(--ember)', fontSize: 16 }}>●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2 — Vendor */}
          {selSociety && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-header">
                <div className="panel-title">🍽️ Select Vendor</div>
                {selVendor && (
                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => { setSelVendor(null); setCart({}) }}>
                    Change
                  </button>
                )}
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {loadingVen ? (
                  <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>Loading vendors...</div>
                ) : vendors.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>No vendors available</div>
                ) : vendors.map(v => (
                  <button
                    key={v._id}
                    onClick={() => { setSelVendor(v); setCart({}) }}
                    style={{
                      background:   selVendor?._id === v._id ? 'var(--blue-dim)' : 'var(--bg-overlay)',
                      border:       `1.5px solid ${selVendor?._id === v._id ? 'var(--blue)' : 'var(--border-dim)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding:      '12px 16px', cursor: 'pointer',
                      textAlign:    'left', transition: 'all 0.15s',
                      display:      'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    {/* Vendor image */}
                    {v.images?.[0] && (
                      <img src={v.images[0]} alt={v.name}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: selVendor?._id === v._id ? '#93C5FD' : 'var(--text-primary)' }}>
                        {v.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        📍 {v.address?.area || v.address?.city || ''} · {v.items?.length || 0} items
                      </div>
                      {v.contact?.mobile_no && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          📞 {v.contact.mobile_no}
                        </div>
                      )}
                    </div>
                    {selVendor?._id === v._id && <span style={{ color: 'var(--blue)', fontSize: 16 }}>●</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Items */}
          {selVendor && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-header">
                <div className="panel-title">🛍️ Select Items</div>
                {totalQty > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 10px',
                    borderRadius: 20, background: 'var(--ember-glow)', color: 'var(--ember)',
                  }}>
                    {totalQty} in cart
                  </span>
                )}
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selVendor.items?.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>No items available</div>
                ) : selVendor.items?.map(item => {
                  const qty = cart[item._id] || 0
                  return (
                    <div key={item._id} style={{
                      display:      'flex', alignItems: 'center', gap: 12,
                      padding:      '12px 14px',
                      background:   qty > 0 ? 'var(--green-dim)' : 'var(--bg-overlay)',
                      border:       `1.5px solid ${qty > 0 ? 'var(--green)' : 'var(--border-dim)'}`,
                      borderRadius: 'var(--radius-md)',
                      transition:   'all 0.15s',
                    }}>
                      {/* Item image */}
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt={item.name}
                          style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.name}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '1px 5px',
                            borderRadius: 4,
                            background: item.veg_or_nonveg === 'veg' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color:      item.veg_or_nonveg === 'veg' ? '#10B981' : '#EF4444',
                          }}>
                            {item.veg_or_nonveg === 'veg' ? '🟢 VEG' : '🔴 NON-VEG'}
                          </span>
                        </div>
                        {item.description && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ember)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                          ₹{item.price}
                        </div>
                      </div>

                      {/* Quantity control */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {qty > 0 ? (
                          <>
                            <button
                              onClick={() => setQty(item._id, qty - 1)}
                              style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--bg-overlay)',
                                border: '1.5px solid var(--border-base)',
                                color: 'var(--text-primary)', fontSize: 16,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >−</button>
                            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)', minWidth: 20, textAlign: 'center' }}>
                              {qty}
                            </span>
                            <button
                              onClick={() => setQty(item._id, qty + 1)}
                              style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--green-dim)',
                                border: '1.5px solid var(--green)',
                                color: '#6EE7B7', fontSize: 16,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >+</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setQty(item._id, 1)}
                            style={{
                              padding: '6px 14px', borderRadius: 8,
                              background: 'var(--bg-overlay)',
                              border: '1.5px solid var(--border-base)',
                              color: 'var(--text-secondary)',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div>
          <div className="panel" style={{ position: 'sticky', top: 80 }}>
            <div className="panel-header">
              <div className="panel-title">📋 Order Summary</div>
            </div>
            <div className="panel-body">

              {/* Selections */}
              <div style={{ marginBottom: 20 }}>
                {[
                  { label: 'Society', value: selSociety?.name },
                  { label: 'Vendor',  value: selVendor?.name  },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: row.value ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                      {row.value ?? '—'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cart items */}
              {cartItems.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                    Items
                  </div>
                  {cartItems.map(item => (
                    <div key={item._id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 13, marginBottom: 6,
                    }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.name}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> × {cart[item._id]}</span>
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        ₹{item.price * cart[item._id]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              {totalAmount > 0 && (
                <div style={{
                  background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)',
                  padding: '12px 16px', marginBottom: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: '1px dashed var(--border-dim)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ember)', fontFamily: 'var(--font-mono)' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Payment method */}
              {cartItems.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Payment Method
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { key: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' },
                      { key: 'online',           label: 'Pay Online',       icon: '📱' },
                    ].map(pm => (
                      <button
                        key={pm.key}
                        onClick={() => setPayMethod(pm.key)}
                        style={{
                          padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                          textAlign: 'left', transition: 'all 0.15s',
                          background:  payMethod === pm.key ? 'var(--ember-glow)' : 'var(--bg-overlay)',
                          border:      `1.5px solid ${payMethod === pm.key ? 'var(--ember)' : 'var(--border-dim)'}`,
                          color:       payMethod === pm.key ? 'var(--ember-bright)' : 'var(--text-secondary)',
                          fontSize: 12, fontWeight: 600,
                        }}
                      >
                        <div style={{ fontSize: 16, marginBottom: 2 }}>{pm.icon}</div>
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <input
                placeholder="Add a note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1.5px solid var(--border-dim)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: 13, color: 'var(--text-primary)',
                  outline: 'none', marginBottom: 16,
                  boxSizing: 'border-box',
                }}
              />

              {/* Place order button */}
              <button
                className="btn-primary"
                onClick={placeOrder}
                disabled={!selSociety || !selVendor || cartItems.length === 0 || placing}
                style={{ width: '100%' }}
              >
                {placing
                  ? <><span className="spinner" /> Placing order…</>
                  : cartItems.length === 0
                    ? 'Add items to order'
                    : `🛍️ Place Order · ₹${totalAmount.toLocaleString('en-IN')}`
                }
              </button>

            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
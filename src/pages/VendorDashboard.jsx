// import { useState, useEffect, useCallback } from 'react'
// import { useToast } from '../contexts/ToastContext'
// import { api } from '../contexts/AuthContext'
// import AppLayout from '../components/AppLayout'

// export default function VendorDashboard() {
//   const toast = useToast()
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState('all')
//   const [updatingId, setUpdatingId] = useState(null)
//   const [expandedOrder, setExpandedOrder] = useState(null) // for status panel

//   /* ── Fetch orders ── */
//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true)
//       const { data } = await api.get('/api/v1/orders/vendor-orders')
//       setOrders(data.data || [])
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to load orders')
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => { fetchOrders() }, [fetchOrders])

//   /* ── Status config ── */
//   const ALL_STATUSES = [
//     { key: 'ordered',     label: 'New Order',       icon: '🆕', color: '#F59E0B' },
//     { key: 'confirmed',   label: 'Preparing',        icon: '👨‍🍳', color: '#3B82F6' },
//     { key: 'on-the-way',  label: 'Out for Delivery', icon: '🛵', color: '#8B5CF6' },
//     { key: 'delivered',   label: 'Delivered',        icon: '✅', color: '#10B981' },
//     { key: 'cancelled',   label: 'Cancelled',        icon: '✕',  color: '#EF4444' },
//   ]

//   // What statuses vendor can manually set from a given current status
//   const ALLOWED_TRANSITIONS = {
//     ordered:      ['confirmed', 'cancelled'],
//     confirmed:    ['ordered', 'on-the-way', 'cancelled'],   // can revert to ordered
//     'on-the-way': ['confirmed', 'delivered', 'cancelled'],  // can revert to confirmed
//     delivered:    [],   // terminal — locked
//     cancelled:    [],   // terminal — locked
//   }

//   const STATUS_BADGE = {
//     ordered:      { label: 'New',             color: '#F59E0B' },
//     confirmed:    { label: 'Preparing',       color: '#3B82F6' },
//     'on-the-way': { label: 'On the Way',      color: '#8B5CF6' },
//     delivered:    { label: 'Delivered',       color: '#10B981' },
//     cancelled:    { label: 'Cancelled',       color: '#EF4444' },
//   }

//   /* ── Actions ── */
//   const changeStatus = async (orderId, newStatus) => {
//     if (updatingId) return
//     setUpdatingId(orderId)
//     try {
//       await api.patch(`/api/v1/orders/${orderId}/status`, { status: newStatus })
//       setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
//       setExpandedOrder(null) // close panel after action
//       toast.success(`Order → ${STATUS_BADGE[newStatus]?.label}`)
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to update order')
//     } finally {
//       setUpdatingId(null)
//     }
//   }

//   const markPaid = async (paymentid) => {
//     if (!paymentid)  return
      
//     setUpdatingId(paymentid)
//     try {
//       await api.patch(`/api/v1/payments/accept-payment/${paymentid}`,{notes:"Payment Collected via cash"})
//       setOrders(prev => prev.map(o => o._id === paymentid ? { ...o, payment_status: 'paid' } : o))
//       toast.success('Payment collected!')
//     } catch {
//       toast.error('Failed to update payment')
//     } finally {
//       setUpdatingId(null)
//     }
//   }

//   /* ── Stats ── */
//   const count = (status) => orders.filter(o => o.status === status).length
//   const totalRevenue = orders
//     .filter(o => o.status !== 'cancelled')
//     .reduce((s, o) => s + (o.total_amount || 0), 0)
//   const totalItems = orders
//     .filter(o => o.status !== 'cancelled')
//     .reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)

//   /* ── Filter & group ── */
//   const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
//   const grouped = filtered.reduce((acc, o) => {
//     const key = o.society?.name || String(o.society) || 'Unknown Society'
//     if (!acc[key]) acc[key] = []
//     acc[key].push(o)
//     return acc
//   }, {})

//   /* ── Helpers ── */
//   const timeAgo = (dateStr) => {
//     const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
//     if (diff < 1)  return 'Just now'
//     if (diff < 60) return `${diff}m ago`
//     return `${Math.floor(diff / 60)}h ago`
//   }

//   const formatTime = (dateStr) =>
//     new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

//   if (loading) return (
//     <AppLayout>
//       <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
//         Loading orders...
//       </div>
//     </AppLayout>
//   )

//   return (
//     <AppLayout pendingCount={count('ordered')}>

//       {/* ── Stats ── */}
//       <div className="metrics-grid">
//         {[
//           { icon: '🆕', label: 'New Orders',      value: count('ordered'),    color: 'var(--ember)',  bg: 'var(--ember-glow)',  alert: count('ordered') > 0 },
//           { icon: '👨‍🍳', label: 'Preparing',       value: count('confirmed'),  color: 'var(--blue)',   bg: 'var(--blue-dim)'    },
//           { icon: '🛵', label: 'Out for Delivery', value: count('on-the-way'), color: 'var(--purple)', bg: 'var(--purple-dim)'  },
//           { icon: '✅', label: 'Delivered',        value: count('delivered'),  color: 'var(--green)',  bg: 'var(--green-dim)'   },
//           { icon: '📦', label: 'Total Items',      value: totalItems,          color: 'var(--blue)',   bg: 'var(--blue-dim)'    },
//           { icon: '₹',  label: "Today's Revenue",  value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'var(--green)', bg: 'var(--green-dim)' },
//         ].map((m, i) => (
//           <div className="metric-card" key={m.label} style={{ animationDelay: `${i * 0.07}s` }}>
//             <div className="metric-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
//             <div className="metric-value">{m.value}</div>
//             <div className="metric-label">{m.label}</div>
//             {m.alert && <div className="metric-delta delta-down">⚠ Action needed</div>}
//           </div>
//         ))}
//       </div>

//       {/* ── Filter bar ── */}
//       <div className="toolbar">
//         <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 }}>
//           Filter:
//         </span>
//         {[
//           { key: 'all',        label: 'All' },
//           { key: 'ordered',    label: 'New' },
//           { key: 'confirmed',  label: 'Preparing' },
//           { key: 'on-the-way', label: 'On the Way' },
//           { key: 'delivered',  label: 'Delivered' },
//           { key: 'cancelled',  label: 'Cancelled' },
//         ].map(f => (
//           <button
//             key={f.key}
//             className={`filter-tab ${filter === f.key ? 'active' : ''}`}
//             onClick={() => setFilter(f.key)}
//           >
//             {f.key === 'all'
//               ? `All (${orders.length})`
//               : `${f.label} (${orders.filter(o => o.status === f.key).length})`
//             }
//           </button>
//         ))}
//         <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
//           <button
//             onClick={fetchOrders}
//             style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
//           >
//             ↻ Refresh
//           </button>
//           <span className="live-dot" />
//           <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//             {orders.length} orders today
//           </span>
//         </div>
//       </div>

//       {/* ── Orders grouped by society ── */}
//       {Object.keys(grouped).length === 0 ? (
//         <div className="panel">
//           <div className="empty-state">
//             <div className="empty-icon">🛵</div>
//             <p>No orders here</p>
//           </div>
//         </div>
//       ) : (
//         Object.entries(grouped).map(([societyName, societyOrders]) => {
//           const societyRevenue = societyOrders
//             .filter(o => o.status !== 'cancelled')
//             .reduce((s, o) => s + (o.total_amount || 0), 0)

//           return (
//             <div key={societyName} style={{ marginBottom: 28 }}>

//               {/* Society header */}
//               <div style={{
//                 display: 'flex', alignItems: 'center', gap: 12,
//                 marginBottom: 12, padding: '10px 16px',
//                 background: 'var(--bg-elevated)',
//                 borderRadius: 'var(--radius-md)',
//                 border: '1px solid var(--border-dim)',
//               }}>
//                 <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//                   🏢 {societyName}
//                 </span>
//                 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                   {societyOrders.length} order{societyOrders.length !== 1 ? 's' : ''}
//                 </span>
//                 <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>
//                   ₹{societyRevenue.toLocaleString('en-IN')}
//                 </span>
//               </div>

//               {/* Order cards */}
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
//                 gap: 14,
//                 marginLeft: 16,
//               }}>
//                 {societyOrders.map((o, idx) => {
//                   const badge = STATUS_BADGE[o.status] || { label: o.status, color: '#888' }
//                   const isUpdating = updatingId === o._id
//                   const isExpanded = expandedOrder === o._id
//                   const isTerminal = ['delivered', 'cancelled'].includes(o.status)
//                   const customerName = o.user?.username || o.last_activity?.[0]?.username || 'Customer'
//                   const customerPhone = o.user?.mobile_no || o.last_activity?.[0]?.mobile_no || ''
//                   const allowedNext = ALLOWED_TRANSITIONS[o.status] || []

//                   return (
//                     <div
//                       className="order-card"
//                       key={o._id}
//                       style={{
//                         animationDelay: `${idx * 0.05}s`,
//                         opacity: o.status === 'cancelled' ? 0.65 : 1,
//                       }}
//                     >
//                       {/* Card header */}
//                       <div className="order-card-header">
//                         <div>
//                           <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//                             {customerName}
//                           </div>
//                           <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
//                             {customerPhone && <span>📞 {customerPhone} · </span>}
//                             <span>🕐 {formatTime(o.createdAt)} · {timeAgo(o.createdAt)}</span>
//                           </div>
//                         </div>
//                         <span style={{
//                           fontSize: 11, fontWeight: 700, padding: '3px 10px',
//                           borderRadius: 20, color: '#fff',
//                           background: badge.color,
//                           whiteSpace: 'nowrap',
//                         }}>
//                           {badge.label}
//                         </span>
//                       </div>

//                       {/* Items breakdown */}
//                       <div style={{
//                         padding: '10px 14px',
//                         borderTop: '1px solid var(--border-subtle)',
//                         borderBottom: '1px solid var(--border-subtle)',
//                       }}>
//                         {o.items.map(item => (
//                           <div key={item._id} style={{
//                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                             fontSize: 13, marginBottom: 5,
//                           }}>
//                             <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
//                               {item.name}
//                             </span>
//                             <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
//                               {item.quantity} × ₹{item.price} = <strong style={{ color: 'var(--text-secondary)' }}>₹{item.total}</strong>
//                             </span>
//                           </div>
//                         ))}
//                         <div style={{
//                           display: 'flex', justifyContent: 'space-between',
//                           marginTop: 8, paddingTop: 8,
//                           borderTop: '1px dashed var(--border-subtle)',
//                           fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
//                         }}>
//                           <span>Order Total</span>
//                           <span>₹{o.total_amount?.toLocaleString('en-IN')}</span>
//                         </div>
//                       </div>

//                       {/* Footer */}
//                       <div className="order-card-body">

//                         {/* Payment row */}
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//                           <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Payment</span>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                             <span style={{
//                               fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
//                               color:       o.payment_status === 'paid' ? '#10B981' : '#F59E0B',
//                               background:  o.payment_status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
//                             }}>
//                               {o.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
//                             </span>
//                             {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
//                               <button
//                                 className="btn-action pay"
//                                 onClick={() => markPaid(o.payment)}
//                                 disabled={isUpdating}
//                                 style={{ padding: '3px 10px', fontSize: 11 }}
//                               >
//                                 {isUpdating ? '...' : '₹ Collect'}
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {/* ── Status control panel ── */}
//                         {!isTerminal && (
//                           <div>
//                             {/* Toggle button */}
//                             <button
//                               onClick={() => setExpandedOrder(isExpanded ? null : o._id)}
//                               style={{
//                                 width: '100%', padding: '8px 12px',
//                                 background: isExpanded ? 'var(--bg-base)' : 'var(--bg-elevated)',
//                                 border: '1px solid var(--border-dim)',
//                                 borderRadius: 8, cursor: 'pointer',
//                                 fontSize: 12, fontWeight: 600,
//                                 color: 'var(--text-secondary)',
//                                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                 transition: 'all 0.15s',
//                               }}
//                             >
//                               <span>🔄 Change Status</span>
//                               <span style={{ fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
//                             </button>

//                             {/* Status options panel */}
//                             {isExpanded && (
//                               <div style={{
//                                 marginTop: 8,
//                                 display: 'grid',
//                                 gridTemplateColumns: '1fr 1fr',
//                                 gap: 6,
//                               }}>
//                                 {ALL_STATUSES.filter(s => allowedNext.includes(s.key)).map(s => (
//                                   <button
//                                     key={s.key}
//                                     onClick={() => changeStatus(o._id, s.key)}
//                                     disabled={isUpdating}
//                                     style={{
//                                       padding: '8px 10px',
//                                       border: `1.5px solid ${s.color}40`,
//                                       borderRadius: 8,
//                                       background: `${s.color}10`,
//                                       color: s.color,
//                                       fontSize: 12, fontWeight: 700,
//                                       cursor: isUpdating ? 'not-allowed' : 'pointer',
//                                       display: 'flex', alignItems: 'center', gap: 6,
//                                       transition: 'all 0.15s',
//                                       opacity: isUpdating ? 0.6 : 1,
//                                     }}
//                                     onMouseEnter={e => e.currentTarget.style.background = `${s.color}25`}
//                                     onMouseLeave={e => e.currentTarget.style.background = `${s.color}10`}
//                                   >
//                                     <span>{s.icon}</span>
//                                     <span>{s.label}</span>
//                                   </button>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}

//                         {/* Terminal state label */}
//                         {isTerminal && (
//                           <div style={{
//                             textAlign: 'center', fontSize: 12, fontWeight: 600,
//                             color: o.status === 'delivered' ? '#10B981' : '#EF4444',
//                             padding: '6px 0',
//                           }}>
//                             {o.status === 'delivered' ? '✅ Order Completed' : '✕ Order Cancelled'}
//                           </div>
//                         )}

//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           )
//         })
//       )}
//     </AppLayout>
//   )
// }



import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'
import { api } from '../contexts/AuthContext'
import AppLayout from '../components/AppLayout'

export default function VendorDashboard() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

  /* ── Fetch orders ── */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/v1/orders/vendor-orders')
      setOrders(data.data || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  /* ── Status config ── */
  const ALL_STATUSES = [
    { key: 'ordered',     label: 'New Order',        icon: '🆕', color: '#F59E0B' },
    { key: 'confirmed',   label: 'Preparing',         icon: '👨‍🍳', color: '#3B82F6' },
    { key: 'on-the-way',  label: 'Out for Delivery',  icon: '🛵', color: '#8B5CF6' },
    { key: 'delivered',   label: 'Delivered',         icon: '✅', color: '#10B981' },
    { key: 'cancelled',   label: 'Cancelled',         icon: '✕',  color: '#EF4444' },
  ]

  const ALLOWED_TRANSITIONS = {
    ordered:      ['confirmed', 'cancelled'],
    confirmed:    ['ordered', 'on-the-way', 'cancelled'],
    'on-the-way': ['confirmed', 'delivered', 'cancelled'],
    delivered:    [],
    cancelled:    [],
  }

  const STATUS_BADGE = {
    ordered:      { label: 'New',           color: '#F59E0B' },
    confirmed:    { label: 'Preparing',     color: '#3B82F6' },
    'on-the-way': { label: 'On the Way',    color: '#8B5CF6' },
    delivered:    { label: 'Delivered',     color: '#10B981' },
    cancelled:    { label: 'Cancelled',     color: '#EF4444' },
  }

  /* ── Actions ── */
  const changeStatus = async (orderId, newStatus) => {
    if (updatingId) return
    setUpdatingId(orderId)
    try {
      await api.patch(`/api/v1/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
      setExpandedOrder(null)
      toast.success(`Order → ${STATUS_BADGE[newStatus]?.label}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update order')
    } finally {
      setUpdatingId(null)
    }
  }

  // ✅ Fixed: match by payment field not order _id
  const markPaid = async (paymentId) => {
    if (!paymentId || updatingId) return
    setUpdatingId(paymentId)
    try {
      await api.patch(`/api/v1/payments/accept-payment/${paymentId}`, { notes: 'Payment Collected via cash' })
      setOrders(prev => prev.map(o => {
        const oPaymentId = o.payment?._id || o.payment
        return oPaymentId === paymentId ? { ...o, payment_status: 'paid' } : o
      }))
      toast.success('Payment collected!')
    } catch {
      toast.error('Failed to update payment')
    } finally {
      setUpdatingId(null)
    }
  }

  /* ── Stats ── */
  const count = (status) => orders.filter(o => o.status === status).length
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total_amount || 0), 0)
  const totalItems = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)

  /* ── Filter & group by society _id ── */
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  // ✅ Fixed: use _id as key to prevent ObjectId string duplicates
  const grouped = filtered.reduce((acc, o) => {
    const societyId = o.society?._id || String(o.society) || 'unknown'
    if (!acc[societyId]) acc[societyId] = { society: o.society, orders: [] }
    acc[societyId].orders.push(o)
    return acc
  }, {})

  /* ── Helpers ── */
  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
    if (diff < 1)  return 'Just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ago`
  }

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-IN', {day:"2-digit",month:"2-digit",year:"2-digit", hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <AppLayout>
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading orders...
      </div>
    </AppLayout>
  )

  return (
    <AppLayout pendingCount={count('ordered')}>

      {/* ── Stats ── */}
      <div className="metrics-grid">
        {[
          { icon: '🆕', label: 'New Orders',       value: count('ordered'),    color: 'var(--ember)',  bg: 'var(--ember-glow)',  alert: count('ordered') > 0 },
          { icon: '👨‍🍳', label: 'Preparing',        value: count('confirmed'),  color: 'var(--blue)',   bg: 'var(--blue-dim)'    },
          { icon: '🛵', label: 'Out for Delivery',  value: count('on-the-way'), color: 'var(--purple)', bg: 'var(--purple-dim)'  },
          { icon: '✅', label: 'Delivered',         value: count('delivered'),  color: 'var(--green)',  bg: 'var(--green-dim)'   },
          { icon: '📦', label: 'Total Items',       value: totalItems,          color: 'var(--blue)',   bg: 'var(--blue-dim)'    },
          { icon: '₹',  label: "Today's Revenue",   value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'var(--green)', bg: 'var(--green-dim)' },
        ].map((m, i) => (
          <div className="metric-card" key={m.label} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="metric-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
            {m.alert && <div className="metric-delta delta-down">⚠ Action needed</div>}
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="toolbar">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 }}>
          Filter:
        </span>
        {[
          { key: 'all',        label: 'All' },
          { key: 'ordered',    label: 'New' },
          { key: 'confirmed',  label: 'Preparing' },
          { key: 'on-the-way', label: 'On the Way' },
          { key: 'delivered',  label: 'Delivered' },
          { key: 'cancelled',  label: 'Cancelled' },
        ].map(f => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.key === 'all'
              ? `All (${orders.length})`
              : `${f.label} (${orders.filter(o => o.status === f.key).length})`
            }
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={fetchOrders}
            style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
          <span className="live-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {orders.length} orders today
          </span>
        </div>
      </div>

      {/* ── Orders grouped by society ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-icon">🛵</div>
            <p>No orders here</p>
          </div>
        </div>
      ) : (
        // ✅ Fixed: destructure { society, orders } from grouped value
        Object.entries(grouped).map(([societyId, { society, orders: societyOrders }]) => {
          const societyName    = society?.name || 'Unknown Society'
          const societyAddress = society?.address
          const societyRevenue = societyOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((s, o) => s + (o.total_amount || 0), 0)

          return (
            <div key={societyId} style={{ marginBottom: 28 }} className='border border-bottom'>

              {/* ✅ Society header with address */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 12, padding: '10px 16px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-dim)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    🏢 {societyName}
                  </div>
                  {/* ✅ Address line shown if populated */}
                  {societyAddress && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      📍 {[
                        societyAddress.plotNo,
                        societyAddress.street,
                        societyAddress.area,
                        societyAddress.city,
                      ].filter(Boolean).join(', ')}
                      {societyAddress.pincode ? ` — ${societyAddress.pincode}` : ''}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                  {societyOrders.length} order{societyOrders.length !== 1 ? 's' : ''}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>
                  ₹{societyRevenue.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Order cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 14,
                marginLeft: 16,
              }}>
                {societyOrders.map((o, idx) => {
                  const badge        = STATUS_BADGE[o.status] || { label: o.status, color: '#888' }
                  const isUpdating   = updatingId === o._id || updatingId === (o.payment?._id || o.payment)
                  const isExpanded   = expandedOrder === o._id
                  const isTerminal   = ['delivered', 'cancelled'].includes(o.status)
                  const customerName  = o.user?.username  || o.last_activity?.[0]?.username  || 'Customer'
                  const customerPhone = o.user?.mobile_no || o.last_activity?.[0]?.mobile_no || ''
                  const allowedNext  = ALLOWED_TRANSITIONS[o.status] || []
                  const paymentId    = o.payment?._id || o.payment

                  return (
                    <div
                      className="order-card"
                      key={o._id}
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                        opacity: o.status === 'cancelled' ? 0.65 : 1,
                      }}
                    >
                      {/* Card header */}
                      <div className="order-card-header">
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {customerName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {customerPhone && <span>📞 {customerPhone} · </span>}
                            <span>🕐 {formatTime(o.createdAt)} · {timeAgo(o.createdAt)}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px',
                          borderRadius: 20, color: '#fff',
                          background: badge.color,
                          whiteSpace: 'nowrap',
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Items breakdown */}
                      <div style={{
                        padding: '10px 14px',
                        borderTop: '1px solid var(--border-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        {o.items.map(item => (
                          <div key={item._id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: 13, marginBottom: 5,
                          }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                              {item.name}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                              {item.quantity} × ₹{item.price} = <strong style={{ color: 'var(--text-secondary)' }}>₹{item.total}</strong>
                            </span>
                          </div>
                        ))}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginTop: 8, paddingTop: 8,
                          borderTop: '1px dashed var(--border-subtle)',
                          fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                        }}>
                          <span>Order Total</span>
                          <span>₹{o.total_amount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="order-card-body">

                        {/* Payment row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Payment
                            {/* ✅ show method if available */}
                            {o.payment?.method && (
                              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                ({o.payment.method === 'cash_on_delivery' ? 'COD' : 'Online'})
                              </span>
                            )}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                              color:      o.payment_status === 'paid' ? '#10B981' : '#F59E0B',
                              background: o.payment_status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            }}>
                              {o.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                            {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
                              <button
                                className="btn-action pay"
                                onClick={() => markPaid(paymentId)}
                                disabled={isUpdating}
                                style={{ padding: '3px 10px', fontSize: 11 }}
                              >
                                {isUpdating ? '...' : '₹ Collect'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status control panel */}
                        {!isTerminal && (
                          <div>
                            <button
                              onClick={() => setExpandedOrder(isExpanded ? null : o._id)}
                              style={{
                                width: '100%', padding: '8px 12px',
                                background: isExpanded ? 'var(--bg-base)' : 'var(--bg-elevated)',
                                border: '1px solid var(--border-dim)',
                                borderRadius: 8, cursor: 'pointer',
                                fontSize: 12, fontWeight: 600,
                                color: 'var(--text-secondary)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'all 0.15s',
                              }}
                            >
                              <span>🔄 Change Status</span>
                              <span style={{ fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
                            </button>

                            {isExpanded && (
                              <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                {ALL_STATUSES.filter(s => allowedNext.includes(s.key)).map(s => (
                                  <button
                                    key={s.key}
                                    onClick={() => changeStatus(o._id, s.key)}
                                    disabled={isUpdating}
                                    style={{
                                      padding: '8px 10px',
                                      border: `1.5px solid ${s.color}40`,
                                      borderRadius: 8,
                                      background: `${s.color}10`,
                                      color: s.color,
                                      fontSize: 12, fontWeight: 700,
                                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                                      display: 'flex', alignItems: 'center', gap: 6,
                                      transition: 'all 0.15s',
                                      opacity: isUpdating ? 0.6 : 1,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = `${s.color}25`}
                                    onMouseLeave={e => e.currentTarget.style.background = `${s.color}10`}
                                  >
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {isTerminal && (
                          <div style={{
                            textAlign: 'center', fontSize: 12, fontWeight: 600,
                            color: o.status === 'delivered' ? '#10B981' : '#EF4444',
                            padding: '6px 0',
                          }}>
                            {o.status === 'delivered' ? '✅ Order Completed' : '✕ Order Cancelled'}
                          </div>
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </AppLayout>
  )
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import AppLayout from "../components/AppLayout";

const STEPS = ["Society", "Restaurant", "Items", "Checkout"];

export default function NewOrder() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [societies, setSocieties] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingSoc, setLoadingSoc] = useState(true);
  const [loadingVen, setLoadingVen] = useState(false);
  const [selSociety, setSelSociety] = useState(null);
  const [selVendor, setSelVendor] = useState(null);
  const [cart, setCart] = useState({});
  const [payMethod, setPayMethod] = useState(null);
  // const [note, setNote] = useState("");
  const [delivery_instructions, setDeliveryInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [vegFilter, setVegFilter] = useState("all"); // all | veg | nonveg
  const [societySearch, setSocietySearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const step = !selSociety
    ? 1
    : !selVendor
      ? 2
      : Object.keys(cart).filter((k) => cart[k] > 0).length === 0
        ? 3
        : 4;

  useEffect(() => {
    api
      .get("/api/v1/societies")
      .then(({ data }) => setSocieties(data.data || []))
      .catch(() => toast.error("Failed to load societies"))
      .finally(() => setLoadingSoc(false));
  }, []);

  useEffect(() => {
    if (!selSociety) return;
    setLoadingVen(true);
    setSelVendor(null);
    setCart({});
    api
      .get("/api/v1/vendors")
      .then(({ data }) => setVendors(data.data || []))
      .catch(() => toast.error("Failed to load vendors"))
      .finally(() => setLoadingVen(false));
  }, [selSociety]);

  const cartItems = selVendor?.items?.filter((i) => cart[i._id] > 0) || [];
  const totalAmount = cartItems.reduce(
    (s, i) => s + i.price * (cart[i._id] || 0),
    0,
  );
  const totalQty = cartItems.reduce((s, i) => s + (cart[i._id] || 0), 0);
  const setQty = (itemId, qty) =>
    setCart((prev) => ({ ...prev, [itemId]: Math.max(0, qty) }));

  // const filteredItems =
  //   selVendor?.items?.filter((item) => {
  //     if (vegFilter === "veg") return item.veg_or_nonveg === "veg";
  //     if (vegFilter === "nonveg") return item.veg_or_nonveg === "nonveg";
  //     return true;
  //   }) || [];

  const filteredItems =
    selVendor?.items?.filter((item) => {
      const matchesVeg =
        vegFilter === "all" || item.veg_or_nonveg === vegFilter;

      const matchesSearch = item.name
        .toLowerCase()
        .includes(itemSearch.toLowerCase());

      return matchesVeg && matchesSearch;
    }) || [];

  // const placeOrder = async () => {
  //   if (!selSociety || !selVendor || cartItems.length === 0) {
  //     toast.error("Complete all selections");
  //     return;
  //   }
  //   setPlacing(true);
  //   try {
  //     const items = cartItems.map((i) => ({
  //       _id: i._id,
  //       quantity: cart[i._id],
  //     }));
  //     const { data } = await api.post("/api/v1/orders", {
  //       vendor: selVendor._id,
  //       society: selSociety._id,
  //       items,
  //       payment_method: payMethod,
  //     });
  //     if (payMethod === "cash_on_delivery") {
  //       toast.success("Order placed successfully!");
  //       navigate("/user/my-orders");
  //       return;
  //     }
  //     const paymentId = data.data?.razorpay?.payment_id;
  //     if (!paymentId) {
  //       toast.error("Payment initiation failed");
  //       return;
  //     }
  //     const { data: initData } = await api.post(
  //       `/api/v1/payments/${paymentId}/razorpay/initiate`,
  //     );
  //     const options = {
  //       key: initData.data.key,
  //       amount: initData.data.amount,
  //       currency: initData.data.currency,
  //       order_id: initData.data.gateway_order_id,
  //       name: selVendor.name,
  //       description: `Order from ${selVendor.name}`,
  //       prefill: initData.data.prefill,
  //       handler: async (response) => {
  //         try {
  //           await api.post(
  //             `/api/v1/payments/${paymentId}/razorpay/verify`,
  //             response,
  //           );
  //           toast.success("Payment successful! 🎉");
  //           navigate("/user/my-orders");
  //         } catch (err) {
  //           toast.error(
  //             err?.response?.data?.message || "Payment verification failed",
  //           );
  //           navigate("/user/my-orders");
  //         }
  //       },
  //       modal: {
  //         ondismiss: () => {
  //           toast.error("Payment cancelled. Order saved as unpaid.");
  //           navigate("/user/my-orders");
  //         },
  //       },
  //       theme: { color: "#f59e0b" },
  //     };
  //     new window.Razorpay(options).open();
  //   } catch (err) {
  //     toast.error(err?.response?.data?.message || "Failed to place order");
  //   } finally {
  //     setPlacing(false);
  //   }
  // };

  const placeOrder = async () => {
    if (!selSociety || !selVendor || cartItems.length === 0) {
      toast.error("Complete all selections");
      return;
    }
    setPlacing(true);
    try {
      const items = cartItems.map((i) => ({
        _id: i._id,
        quantity: cart[i._id],
      }));
      const { data } = await api.post("/api/v1/orders", {
        vendor: selVendor._id,
        society: selSociety._id,
        items,
        payment_method: payMethod,
        delivery_instructions,
      });

      // ── COD ──
      if (payMethod === "cash_on_delivery") {
        toast.success("Order placed successfully!");
        navigate("/user/my-orders");
        return;
      }

      // ── Online ──
      const paymentId = data.data?.razorpay?.payment_id;
      if (!paymentId) {
        toast.error("Payment initiation failed");
        return;
      }

      const { data: initData } = await api.post(
        `/api/v1/payments/${paymentId}/razorpay/initiate`,
      );

      // ✅ disable place order button while Razorpay modal is open
      setPaymentInProgress(true);

      const options = {
        key: initData.data.key,
        amount: initData.data.amount,
        currency: initData.data.currency,
        order_id: initData.data.gateway_order_id,
        name: selVendor.name,
        description: `Order from ${selVendor.name}`,
        prefill: initData.data.prefill,

        handler: async (response) => {
          try {
            await api.post(
              `/api/v1/payments/${paymentId}/razorpay/verify`,
              response,
            );
            // ✅ payment done toast before redirect
            toast.success("Payment done! Redirecting to orders...");
            // setTimeout(() =>
            navigate("/user/my-orders");
            // , 1500); // small delay so toast is visible
          } catch (err) {
            setPaymentInProgress(false); // re-enable on verify fail
            toast.error(
              err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Payment verification failed",
            );
            navigate("/user/my-orders");
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentInProgress(false); // ✅ re-enable if user closes modal
            toast.error("Payment cancelled. Order saved as unpaid.");
            navigate("/user/my-orders");
          },
        },

        theme: { color: "#f59e0b" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setPaymentInProgress(false);
      toast.error(err?.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const filteredSocieties = societies.filter((s) =>
    `${s.name} ${s.address?.area} ${s.address?.city}`
      .toLowerCase()
      .includes(societySearch.toLowerCase()),
  );

  const filteredRestaurants = vendors.filter((r) =>
    `${r.name} ${r.address?.area} ${r.address?.city}`
      .toLowerCase()
      .includes(restaurantSearch.toLowerCase()),
  );

  return (
    <AppLayout>
      <style>{`
        .no-page { max-width: 1100px; margin: 0 auto; }

        /* ── STEP BAR ── */
        .no-stepbar {
          display: flex;justify-content: center; align-items: center; gap: 0;flex-wrap: wrap;
          background: var(--bg-elevated);
          border: 1px solid var(--border-dim);
          border-radius: 999px;
          padding: 6px 8px;
          margin-bottom: 28px;
          width: fit-content;
        }
        .no-step {
          display: flex; align-items: center; gap: 7px;
          padding: 6px 14px; border-radius: 999px;
          margin:0px 5px;
          font-size: 12px; font-weight: 700;
          transition: all 0.25s;
          color: var(--text-muted);
        }
        .no-step.done { color: var(--green); }
        .no-step.active { background: var(--ember); color: #000; }
        .no-step-dot {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; flex-shrink: 0;
          background: var(--bg-overlay); border: 1.5px solid var(--border-dim);
        }
        .no-step.done .no-step-dot { background: var(--green-dim); border-color: var(--green); color: var(--green); }
        .no-step.active .no-step-dot { background: rgba(0,0,0,0.2); border-color: rgba(0,0,0,0.2); color: #000; }
        .no-step-divider { width: 20px; height: 1px; background: var(--border-dim); }

        /* ── LAYOUT ── */
        .no-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }

        /* ── SECTION HEADER ── */
        .no-section-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .no-section-title {
          font-size: 16px; font-weight: 800; letter-spacing: -0.4px;
          display: flex; align-items: center; gap: 8px;
        }
        .no-section-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px;
          border-radius: 999px; background: var(--ember-glow); color: var(--ember);
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* ── SOCIETY GRID ── */
        .no-society-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .no-society-card {
          background: var(--bg-elevated); border: 1.5px solid var(--border-dim);
          border-radius: 14px; padding: 16px; cursor: pointer;
          transition: all 0.2s; text-align: left;
        }
        .no-society-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
        .no-society-card.selected { border-color: var(--ember); background: var(--ember-glow); }
        .no-society-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--bg-overlay); border: 1px solid var(--border-dim);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 10px;
        }
        .no-society-name { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
        .no-society-addr { font-size: 11px; color: var(--text-muted); }

        /* ── VENDOR CARD ── */
        .no-vendor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .no-vendor-card {
          background: var(--bg-elevated); border: 1.5px solid var(--border-dim);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          transition: all 0.2s; text-align: left;
        }
        .no-vendor-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border-base); }
        .no-vendor-card.selected { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-dim); }
        .no-vendor-img {
          width: 100%; height: 100px; object-fit: cover;
          background: var(--bg-overlay);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
        }
        .no-vendor-body { padding: 12px 14px; }
        .no-vendor-name { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
        .no-vendor-meta { font-size: 11px; color: var(--text-muted); display: flex; gap: 10px; flex-wrap: wrap; }
        .no-vendor-tag {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 600; padding: 2px 7px;
          border-radius: 999px; background: var(--green-dim); color: var(--green);
          margin-top: 6px;
        }

         .no-vendor-tag-unavailable {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 600; padding: 2px 7px;
          border-radius: 999px; background: var(--red-dim); color: var(--red);
          margin-top: 6px;
        }

        /* ── VEG FILTER ── */
        .no-veg-filter { display: flex; gap: 6px; }
        .no-veg-btn {
          padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700;
          border: 1.5px solid var(--border-dim); background: var(--bg-elevated);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
          font-family: var(--font-display);
        }
        .no-veg-btn:hover { border-color: var(--border-strong); }
        .no-veg-btn.veg-active-veg { border-color: var(--green); background: var(--green-dim); color: var(--green); }
        .no-veg-btn.veg-active-nonveg { border-color: var(--red); background: var(--red-dim); color: var(--red); }
        .no-veg-btn.veg-active-all { border-color: var(--ember); background: var(--ember-glow); color: var(--ember); }

        /* ── ITEM CARD ── */
        .no-item-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px; border-radius: 14px;
          background: var(--bg-elevated); border: 1px solid var(--border-dim);
          transition: all 0.15s; position: relative; overflow: hidden;
        }
        .no-item-card.in-cart { border-color: var(--green); background: var(--bg-elevated); }
        .no-item-card.in-cart::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: var(--green); border-radius: 3px 0 0 3px;
        }
        .no-item-img {
          width: 72px; height: 72px; border-radius: 10px; object-fit: cover;
          flex-shrink: 0; background: var(--bg-overlay);
          display: flex; align-items: center; justify-content: center; font-size: 28px;
        }
        .no-item-info { flex: 1; min-width: 0; }
        .no-item-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
        .no-item-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .no-item-price { font-size: 15px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); }
        .no-veg-dot {
          width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0;
          border: 1.5px solid; display: flex; align-items: center; justify-content: center;
        }
        .no-veg-dot.veg { border-color: var(--green); }
        .no-veg-dot.veg::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
        .no-veg-dot.nonveg { border-color: var(--red); }
        .no-veg-dot.nonveg::after { content: ''; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 7px solid var(--red); margin-top: -1px; }

        /* ── QTY CONTROL ── */
        .no-qty { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .no-qty-btn {
          width: 20px; height: 20px; border-radius: 8px; border: none;
          font-size: 18px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; line-height: 1;
        }
        .no-qty-btn.minus { background: var(--bg-overlay); color: var(--text-primary); border: 1.5px solid var(--border-base); }
        .no-qty-btn.minus:hover { background: var(--red-dim); border-color: var(--red); color: var(--red); }
        .no-qty-btn.plus { background: var(--ember); color: #000; }
        .no-qty-btn.plus:hover { background: var(--ember-bright); }
        .no-qty-num { font-size: 16px; font-weight: 800; color: var(--text-primary); min-width: 24px; text-align: center; }
        .no-add-btn {
          padding: 5px; border-radius: 8px; border: 1.5px solid var(--ember);
          background: var(--ember-glow); color: var(--ember-bright);
          font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s;
          font-family: var(--font-display); white-space: nowrap;
        }
        .no-add-btn:hover { background: var(--ember); color: #000; }

        /* ── CART PANEL ── */
        .no-cart {
          background: var(--bg-elevated); border: 1px solid var(--border-dim);
          border-radius: 20px; overflow: hidden; position: sticky; top: 80px;
        }
        .no-cart-header {
          padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
          display: flex; align-items: center; justify-content: space-between;
        }
        .no-cart-title { font-size: 15px; font-weight: 800; }
        .no-cart-count {
          background: var(--ember); color: #000;
          font-size: 11px; font-weight: 800; padding: 2px 8px;
          border-radius: 999px; font-family: var(--font-mono);
        }
        .no-cart-body { padding: 16px 20px; }
        .no-cart-empty { text-align: center; padding: 32px 0; color: var(--text-muted); font-size: 13px; }
        .no-cart-empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.4; }

        .no-cart-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid var(--border-subtle); gap: 8px;
        }
        .no-cart-row:last-child { border-bottom: none; }
        .no-cart-item-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .no-cart-item-qty { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .no-cart-item-price { font-size: 13px; font-weight: 700; font-family: var(--font-mono); color: var(--text-primary); white-space: nowrap; }

        .no-cart-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0 0; margin-top: 4px;
          border-top: 2px dashed var(--border-dim);
        }
        .no-cart-total-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
        .no-cart-total-val { font-size: 22px; font-weight: 800; color: var(--ember); font-family: var(--font-mono); }

        /* ── PAY METHOD ── */
        .no-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0; }
        .no-pay-btn {
          padding: 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s;
          border: 1.5px solid var(--border-dim); background: var(--bg-overlay);
          text-align: left; font-family: var(--font-display);
        }
        .no-pay-btn.selected { border-color: var(--ember); background: var(--ember-glow); }
        .no-pay-icon { font-size: 20px; margin-bottom: 4px; }
        .no-pay-label { font-size: 11px; font-weight: 700; color: var(--text-primary); }
        .no-pay-sub { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
        .no-pay-btn.selected .no-pay-label { color: var(--ember-bright); }

        /* ── NOTE ── */
        .no-note {
          width: 100%; background: var(--bg-overlay); border: 1.5px solid var(--border-dim);
          border-radius: 10px; padding: 10px 12px; font-size: 13px;
          color: var(--text-primary); outline: none; resize: none;
          font-family: var(--font-display); box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .no-note:focus { border-color: var(--ember); }
        .no-note::placeholder { color: var(--text-muted); }

        /* ── PLACE ORDER ── */
        .no-place-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: var(--ember); color: #000; font-size: 14px; font-weight: 800;
          cursor: pointer; transition: all 0.2s; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-display); letter-spacing: -0.3px;
          margin-top: 14px;
        }
        .no-place-btn:hover:not(:disabled) { background: var(--ember-bright); transform: translateY(-1px); box-shadow: var(--glow-ember); }
        .no-place-btn:disabled { background: var(--bg-active); color: var(--text-muted); cursor: not-allowed; }

        /* ── SELECTED BANNER ── */
        .no-selected-banner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-radius: 10px; margin-bottom: 12px;
          background: var(--ember-glow); border: 1px solid var(--ember-dim);
        }
        .no-selected-name { font-size: 13px; font-weight: 700; color: var(--ember-bright); }
        .no-selected-change { font-size: 11px; font-weight: 600; color: var(--ember); cursor: pointer; text-decoration: underline; background: none; border: none; font-family: var(--font-display); }

        /* ── SKELETON ── */
        .no-skeleton { border-radius: 10px; background: linear-gradient(90deg, var(--bg-overlay) 25%, var(--bg-hover) 50%, var(--bg-overlay) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }

        @media (max-width: 900px) {
          .no-layout { grid-template-columns: 1fr; }
          .no-cart { position: static; }
        }
      `}</style>

      <div className="no-page">
        {/* ── STEP BAR ── */}
        <div className="no-stepbar">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className={`no-step ${done ? "done" : active ? "active" : ""}`}
                >
                  <div className="no-step-dot">{done ? "✓" : n}</div>
                  {label}
                </div>
                {i < STEPS.length - 1 && <div className="no-step-divider" />}
              </div>
            );
          })}
        </div>

        <div className="no-layout">
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* ── STEP 1: SOCIETY ── */}
            <div>
              <div className="no-section-head">
                <div className="no-section-title">
                  🏢 Choose your society
                  {selSociety && (
                    <span className="no-section-badge">✓ Selected</span>
                  )}
                </div>
              </div>

              {selSociety ? (
                <div className="no-selected-banner">
                  <div>
                    <div className="no-selected-name">🏢 {selSociety.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      📍 {selSociety.address?.area}, {selSociety.address?.city}
                    </div>
                  </div>
                  <button
                    className="no-selected-change"
                    onClick={() => {
                      setSelSociety(null);
                      setSelVendor(null);
                      setCart({});
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : loadingSoc ? (
                <div className="no-society-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="no-skeleton"
                      style={{ height: 90 }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="🔍 Search Society..."
                    value={societySearch}
                    onChange={(e) => setSocietySearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      marginBottom: "12px",
                      borderRadius: "10px",
                      border: "1.5px solid var(--border-dim)",
                      background: "var(--bg-overlay)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <div className="no-society-grid">
                    {filteredSocieties.map((s) => (
                      <button
                        key={s._id}
                        className={`no-society-card ${selSociety?._id === s._id ? "selected" : ""}`}
                        onClick={() => setSelSociety(s)}
                      >
                        <div className="no-society-icon">🏢</div>
                        <div className="no-society-name">{s.name}</div>
                        <div className="no-society-addr">
                          📍 {s.address?.area}, {s.address?.city}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── STEP 2: VENDOR ── */}
            {selSociety && (
              <div>
                <div className="no-section-head">
                  <div className="no-section-title">
                    🍽️ Pick a restaurant
                    {selVendor && (
                      <span className="no-section-badge">✓ Selected</span>
                    )}
                  </div>
                </div>

                {selVendor ? (
                  <div
                    className="no-selected-banner"
                    style={{
                      background: "var(--blue-dim)",
                      borderColor: "var(--blue)",
                    }}
                  >
                    <div>
                      <div
                        className="no-selected-name"
                        // style={{ color: "#93C5FD" }}
                      >
                        🍽️ {selVendor.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {selVendor.items?.length || 0} items ·{" "}
                        {selVendor.address?.area || selVendor.address?.city}
                      </div>
                    </div>
                    <button
                      className="no-selected-change"
                      style={{ color: "var(--blue)" }}
                      onClick={() => {
                        setSelVendor(null);
                        setCart({});
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : loadingVen ? (
                  <div className="no-vendor-grid">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="no-skeleton"
                        style={{ height: 160, borderRadius: 16 }}
                      />
                    ))}
                  </div>
                ) : vendors.length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: 13,
                      background: "var(--bg-elevated)",
                      borderRadius: 14,
                      border: "1px solid var(--border-dim)",
                    }}
                  >
                    😔 No Restaurant available right now
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="🔍 Search Restaurants..."
                      value={restaurantSearch}
                      onChange={(e) => setRestaurantSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        marginBottom: "12px",
                        borderRadius: "10px",
                        border: "1.5px solid var(--border-dim)",
                        background: "var(--bg-overlay)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <div className="no-vendor-grid">
                      {filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map((v) => (
                          <button
                            key={v._id}
                            className={`no-vendor-card ${selVendor?._id === v._id ? "selected" : ""}`}
                            onClick={() => {
                              setSelVendor(v);
                              setCart({});
                            }}
                          >
                            {v.images?.[0] ? (
                              <img
                                src={v.images[0]}
                                alt={v.name}
                                className="no-vendor-img"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="no-vendor-img">🍱</div>
                            )}
                            <div className="no-vendor-body">
                              <div className="no-vendor-name">{v.name}</div>
                              <div className="no-vendor-meta">
                                <span>
                                  📍 {v.address?.area || v.address?.city || "—"}
                                </span>
                                <span>🍽️ {v.items?.length || 0} items</span>
                              </div>
                              {v.contact?.mobile_no && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                    marginTop: 4,
                                  }}
                                >
                                  📞 {v.contact.mobile_no}
                                </div>
                              )}
                              {v.isActive ? (
                                <div className="no-vendor-tag"> ✓ Open Now</div>
                              ) : (
                                <div className="no-vendor-tag-unavailable">
                                  {" "}
                                  ✗ Closed
                                </div>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="no-vendor-tag-unavailable">
                          No restaurants found
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── STEP 3: ITEMS ── */}
            {selVendor && (
              <>
                {selVendor.isActive ? (
                  <div>
                    <div className="no-section-head">
                      <div className="no-section-title">
                        🛍️ Select items
                        {totalQty > 0 && (
                          <span className="no-section-badge">
                            {totalQty} in cart
                          </span>
                        )}
                      </div>
                      <div className="no-veg-filter">
                        {[
                          { key: "all", label: "All" },
                          { key: "veg", label: "🟢 Veg" },
                          { key: "nonveg", label: "🔴 Non-Veg" },
                        ].map((f) => (
                          <button
                            key={f.key}
                            className={`no-veg-btn ${vegFilter === f.key ? `veg-active-${f.key}` : ""}`}
                            onClick={() => setVegFilter(f.key)}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="🔍 Search items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        marginBottom: "12px",
                        borderRadius: "10px",
                        border: "1.5px solid var(--border-dim)",
                        background: "var(--bg-overlay)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {filteredItems.length === 0 ? (
                        <div
                          style={{
                            padding: 24,
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: 13,
                          }}
                        >
                          No items in this category
                        </div>
                      ) : (
                        filteredItems.map((item) => {
                          const qty = cart[item._id] || 0;
                          return (
                            <div
                              key={item._id}
                              className={`no-item-card ${qty > 0 ? "in-cart" : ""}`}
                            >
                              {/* Veg dot */}
                              <div
                                style={{
                                  alignSelf: "flex-start",
                                  marginTop: 2,
                                }}
                              >
                                <div
                                  className={`no-veg-dot ${item.veg_or_nonveg}`}
                                />
                              </div>

                              {/* Info */}
                              {/* Image */}
                              {item.images?.[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.name}
                                  className="no-item-img"
                                  onError={(e) =>
                                    (e.target.style.display = "none")
                                  }
                                />
                              ) : (
                                <div className="no-item-img">🍱</div>
                              )}
                              <div className="no-item-info">
                                <div className="no-item-name">{item.name}</div>
                                {item.description && (
                                  <div className="no-item-desc">
                                    {item.description}
                                  </div>
                                )}
                                <div className="no-item-price">
                                  ₹{item.price}
                                </div>
                              </div>

                              {/* Qty */}
                              <div
                                className="no-qty"
                                style={{
                                  position: "absolute",
                                  bottom: 14,
                                  right: 14,
                                }}
                              >
                                {qty > 0 ? (
                                  <>
                                    <button
                                      className="no-qty-btn minus"
                                      onClick={() => setQty(item._id, qty - 1)}
                                    >
                                      −
                                    </button>
                                    <span className="no-qty-num">{qty}</span>
                                    <button
                                      className="no-qty-btn plus"
                                      onClick={() => setQty(item._id, qty + 1)}
                                    >
                                      +
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="no-add-btn"
                                    onClick={() => setQty(item._id, 1)}
                                  >
                                    ADD +
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-selected-banner">
                    This Restaurant is currently not accepting orders. Please
                    select another Restaurant to place your order.
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: CART ── */}
          <div>
            <div className="no-cart">
              <div className="no-cart-header">
                <div className="no-cart-title">🛒 Your Order</div>
                {totalQty > 0 && (
                  <div className="no-cart-count">{totalQty} items</div>
                )}
              </div>

              <div className="no-cart-body">
                {/* Society + Vendor info */}
                {(selSociety || selVendor) && (
                  <div
                    style={{
                      marginBottom: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {selSociety && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>
                          Society
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {selSociety.name}
                        </span>
                      </div>
                    )}
                    {selVendor && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>From</span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {selVendor.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {cartItems.length === 0 ? (
                  <div className="no-cart-empty">
                    <div className="no-cart-empty-icon">🛒</div>
                    <p>Your cart is empty</p>
                    <p style={{ marginTop: 4, fontSize: 11 }}>
                      Add items to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Items */}
                    <div style={{ marginBottom: 4 }}>
                      {cartItems.map((item) => (
                        <div key={item._id} className="no-cart-row">
                          <div>
                            <div className="no-cart-item-name">{item.name}</div>
                            <div className="no-cart-item-qty">
                              × {cart[item._id]}
                            </div>
                          </div>
                          <div className="no-cart-item-price">
                            ₹{item.price * cart[item._id]}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="no-cart-total">
                      <span className="no-cart-total-label">Total</span>
                      <span className="no-cart-total-val">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Payment method */}
                    <div style={{ marginTop: 16 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          marginBottom: 8,
                        }}
                      >
                        Payment
                      </div>
                      <div className="no-pay-grid">
                        {[
                          {
                            key: "cash_on_delivery",
                            icon: "💵",
                            label: "Cash on Delivery",
                            sub: "Pay when delivered",
                          },
                          // {
                          //   key: "online",
                          //   icon: "📱",
                          //   label: "Pay Online",
                          //   sub: "UPI / Card / Netbanking",
                          // },
                        ].map((pm) => (
                          <button
                            key={pm.key}
                            className={`no-pay-btn ${payMethod === pm.key ? "selected" : ""}`}
                            onClick={() => setPayMethod(pm.key)}
                          >
                            <div className="no-pay-icon">{pm.icon}</div>
                            <div className="no-pay-label">{pm.label}</div>
                            <div className="no-pay-sub">{pm.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <textarea
                      className="no-note"
                      rows={2}
                      placeholder="Add delivery instructions..."
                      value={delivery_instructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      style={{ marginTop: 12 }}
                    />
                  </>
                )}

                {/* Place order */}
                {/* <button
                  className="no-place-btn"
                  onClick={placeOrder}
                  disabled={
                    !selSociety ||
                    !selVendor ||
                    cartItems.length === 0 ||
                    placing
                  }
                >
                  {placing ? (
                    <>
                      <span
                        className="spinner"
                        style={{ width: 16, height: 16, borderWidth: 2 }}
                      />{" "}
                      Placing order…
                    </>
                  ) : cartItems.length === 0 ? (
                    "Add items to continue"
                  ) : (
                    "Place Order"
                  )}
                </button> */}

                <button
                  className="no-place-btn"
                  onClick={placeOrder}
                  disabled={
                    !selSociety ||
                    !selVendor ||
                    cartItems.length === 0 ||
                    placing ||
                    paymentInProgress || // ← add this
                    !payMethod // require payment method selection
                  }
                >
                  {placing ? (
                    <>
                      <span
                        className="spinner"
                        style={{ width: 16, height: 16, borderWidth: 2 }}
                      />{" "}
                      Placing order…
                    </>
                  ) : paymentInProgress ? (
                    // ✅ show waiting state while Razorpay modal is open
                    <>
                      <span
                        className="spinner"
                        style={{ width: 16, height: 16, borderWidth: 2 }}
                      />{" "}
                      Waiting for payment…
                    </>
                  ) : cartItems.length === 0 ? (
                    "Add items to continue"
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

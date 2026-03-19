// ── SOCIETIES ──────────────────────────────────────────────
export const SOCIETIES = [
    {
      id: 's1',
      name: 'Green Valley Society',
      city: 'Pune',
      towers: [
        {
          id: 't1',
          name: 'Tower A',
          floors: [
            { id: 'f1', num: 1, orgs: ['Infosys BPO', 'Wipro Digital'] },
            { id: 'f2', num: 2, orgs: ['TCS Hub', 'Cognizant']         },
            { id: 'f3', num: 3, orgs: ['Persistent', 'Mphasis']        },
          ],
        },
        {
          id: 't2',
          name: 'Tower B',
          floors: [
            { id: 'f4', num: 1, orgs: ['HCL Tech', 'Hexaware'] },
            { id: 'f5', num: 2, orgs: ["L&T Infotech"]          },
          ],
        },
      ],
    },
    {
      id: 's2',
      name: 'Sunset Heights',
      city: 'Pune',
      towers: [
        {
          id: 't3',
          name: 'East Wing',
          floors: [
            { id: 'f6', num: 1, orgs: ['HDFC Bank IT', 'Barclays']  },
            { id: 'f7', num: 2, orgs: ['Pune Metro Corp']            },
          ],
        },
      ],
    },
  ]
  
  // ── TODAY'S DATE ───────────────────────────────────────────
  const fmt = (d) => d.toISOString().split('T')[0]
  const today = new Date()
  
  // ── MOCK ORDERS ────────────────────────────────────────────
  export const MOCK_ORDERS = [
    { id: 'o1',  userId: 'u1',  userName: 'Priya Sharma',   society: 'Green Valley Society', tower: 'Tower A',   floor: 3, org: 'Persistent',     count: 2, status: 'delivered', payStatus: 'paid',   orderDate: fmt(today), amount: 120 },
    { id: 'o2',  userId: 'u2',  userName: 'Arjun Mehta',    society: 'Green Valley Society', tower: 'Tower A',   floor: 1, org: 'Infosys BPO',    count: 1, status: 'confirmed', payStatus: 'unpaid', orderDate: fmt(today), amount: 60  },
    { id: 'o3',  userId: 'u3',  userName: 'Sneha Kulkarni', society: 'Green Valley Society', tower: 'Tower B',   floor: 1, org: 'HCL Tech',       count: 3, status: 'pending',   payStatus: 'unpaid', orderDate: fmt(today), amount: 180 },
    { id: 'o4',  userId: 'u4',  userName: 'Rahul Desai',    society: 'Sunset Heights',       tower: 'East Wing', floor: 1, org: 'HDFC Bank IT',   count: 2, status: 'delivered', payStatus: 'paid',   orderDate: fmt(today), amount: 120 },
    { id: 'o5',  userId: 'u5',  userName: 'Kavya Nair',     society: 'Green Valley Society', tower: 'Tower A',   floor: 2, org: 'TCS Hub',        count: 1, status: 'confirmed', payStatus: 'unpaid', orderDate: fmt(today), amount: 60  },
    { id: 'o6',  userId: 'u6',  userName: 'Nikhil Joshi',   society: 'Green Valley Society', tower: 'Tower A',   floor: 1, org: 'Wipro Digital',  count: 2, status: 'pending',   payStatus: 'unpaid', orderDate: fmt(today), amount: 120 },
    { id: 'o7',  userId: 'u7',  userName: 'Pooja Wagh',     society: 'Sunset Heights',       tower: 'East Wing', floor: 2, org: 'Pune Metro Corp',count: 1, status: 'delivered', payStatus: 'paid',   orderDate: fmt(today), amount: 60  },
    { id: 'o8',  userId: 'u8',  userName: 'Siddharth Rao',  society: 'Green Valley Society', tower: 'Tower B',   floor: 2, org: "L&T Infotech",   count: 3, status: 'pending',   payStatus: 'unpaid', orderDate: fmt(today), amount: 180 },
    { id: 'o9',  userId: 'u9',  userName: 'Anjali Patel',   society: 'Green Valley Society', tower: 'Tower A',   floor: 3, org: 'Mphasis',        count: 1, status: 'confirmed', payStatus: 'paid',   orderDate: fmt(today), amount: 60  },
    { id: 'o10', userId: 'u10', userName: 'Rohan Kulkarni', society: 'Green Valley Society', tower: 'Tower A',   floor: 2, org: 'Cognizant',      count: 2, status: 'delivered', payStatus: 'paid',   orderDate: fmt(today), amount: 120 },
  ]
  
  // ── VENDORS ────────────────────────────────────────────────
  export const VENDORS = [
    { id: 'v1', name: 'Ghar ka Khana',  vendorName: 'Ramesh Bhai', delivered: 6, pending: 2, confirmed: 4, revenue: 720, rating: 4.8 },
    { id: 'v2', name: 'Tiffin Express', vendorName: 'Meena Tai',   delivered: 4, pending: 3, confirmed: 2, revenue: 540, rating: 4.5 },
  ]
  
  // ── WEEKLY CHART DATA ──────────────────────────────────────
  export const WEEKLY_DATA = [
    { day: 'Mon', orders: 34, delivered: 32, revenue: 2040 },
    { day: 'Tue', orders: 41, delivered: 38, revenue: 2460 },
    { day: 'Wed', orders: 38, delivered: 35, revenue: 2280 },
    { day: 'Thu', orders: 52, delivered: 50, revenue: 3120 },
    { day: 'Fri', orders: 47, delivered: 44, revenue: 2820 },
    { day: 'Sat', orders: 28, delivered: 26, revenue: 1680 },
    { day: 'Sun', orders: 18, delivered: 16, revenue: 1080 },
  ]
  
  // ── MY ORDER HISTORY (for logged-in user) ──────────────────
  export const MY_ORDER_HISTORY = [
    { id: 'h1', date: '2025-01-08', count: 2, status: 'delivered', amount: 120, payStatus: 'paid'   },
    { id: 'h2', date: '2025-01-07', count: 1, status: 'delivered', amount: 60,  payStatus: 'paid'   },
    { id: 'h3', date: '2025-01-06', count: 2, status: 'delivered', amount: 120, payStatus: 'paid'   },
    { id: 'h4', date: '2025-01-05', count: 3, status: 'delivered', amount: 180, payStatus: 'unpaid' },
    { id: 'h5', date: '2025-01-04', count: 1, status: 'cancelled', amount: 0,   payStatus: 'unpaid' },
    { id: 'h6', date: '2025-01-03', count: 2, status: 'delivered', amount: 120, payStatus: 'paid'   },
  ]
// src/layouts/AppLayout.jsx
// Theme variables live in index.css – ThemeContext sets data-theme on <html>

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useTheme } from '../contexts/ThemeContext'

const NAVS = {
  user: [
    { path: '/user/dashboard', icon: '⊞', label: 'Dashboard'             },
    { path: '/user/order',     icon: '🍱', label: 'New Order', badge: null },
    { path: '/user/my-orders', icon: '📋', label: 'My Orders'             },
    { path: '/user/profile',   icon: '◉',  label: 'Profile'               },
  ],
  vendor_admin: [
    { path: '/vendor/dashboard', icon: '⊞', label: 'Dashboard'            },
    { path: '/vendor/orders',    icon: '📦', label: "Today's Orders", badge: 'live' },
    { path: '/vendor/payments',  icon: '₹',  label: 'Payments'             },
    { path: '/vendor/reports',   icon: '📊', label: 'Reports'              },
  ],
  master_admin: [
    { path: '/admin/dashboard', icon: '⊞', label: 'Dashboard'             },
    { path: '/admin/orders',    icon: '📦', label: 'Live Orders',  badge: 'live' },
    { path: '/admin/vendors',   icon: '🏪', label: 'Vendor Status'         },
    { path: '/admin/societies', icon: '🏢', label: 'Societies'             },
    { path: '/admin/reports',   icon: '📊', label: 'Reports'               },
  ],
}

const ROLE_META = {
  user:         { label: 'User',         avatarClass: 'avatar-user'   },
  vendor_admin: { label: 'Vendor Admin', avatarClass: 'avatar-vendor' },
  master_admin: { label: 'Master Admin', avatarClass: 'avatar-master' },
}

const TITLES = {
  '/user/dashboard':   { title: 'My Dashboard',      sub: 'Your tiffin overview'              },
  '/user/order':       { title: 'Order Tiffin',       sub: "Place today's order"               },
  '/user/my-orders':   { title: 'My Orders',          sub: 'Order history & payments'          },
  '/user/profile':     { title: 'My Profile',         sub: 'Account & settings'                },
  '/vendor/dashboard': { title: 'Vendor Dashboard',   sub: "Today's operations at a glance"    },
  '/vendor/orders':    { title: "Today's Orders",     sub: 'Manage and dispatch orders'        },
  '/vendor/payments':  { title: 'Payments',           sub: 'Collection status'                 },
  '/vendor/reports':   { title: 'Reports',            sub: 'Weekly & monthly analytics'        },
  '/admin/dashboard':  { title: 'Command Center',     sub: 'Platform-wide overview'            },
  '/admin/orders':     { title: 'Live Order Feed',    sub: 'Real-time order & delivery status' },
  '/admin/vendors':    { title: 'Vendor Performance', sub: 'Delivery & payment tracking'       },
  '/admin/societies':  { title: 'Societies',          sub: 'Society, tower & org management'   },
  '/admin/reports':    { title: 'Analytics',          sub: 'Platform-wide reports'             },
}

// export default function AppLayout({ children, pendingCount = 0 }) {
//   const { user, logout }       = useAuth()
//   const toast                  = useToast()
//   const navigate               = useNavigate()
//   const location               = useLocation()
//   const { theme, toggleTheme } = useTheme()

//   const navItems = NAVS[user?.user_type]      ?? []
//   const meta     = ROLE_META[user?.user_type] ?? {}
//   const pageInfo = TITLES[location.pathname] ?? { title: 'TiffinOS', sub: '' }

//   const doLogout = () => {
//     logout()
//     toast.info('Signed out successfully')
//     navigate('/login')
//   }

//   const dateStr = new Date().toLocaleDateString('en-IN', {
//     weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
//   })

//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <div className="sidebar-top">
//           <div className="sidebar-logo">
//             <div className="logo-mark">🍱</div>
//             <div className="logo-text">Tiffin<span>OS</span></div>
//           </div>
//         </div>

//         <nav className="sidebar-nav">
//           <div className="nav-section">
//             <div className="nav-section-title">Navigation</div>
//             {navItems.map(item => (
//               <button
//                 key={item.path}
//                 className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
//                 onClick={() => navigate(item.path)}
//               >
//                 <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
//                 {item.label}
//                 {item.badge === 'live' && pendingCount > 0 && (
//                   <span className="nav-badge">{pendingCount}</span>
//                 )}
//               </button>
//             ))}
//           </div>

//           <div className="nav-section">
//             <div className="nav-section-title">System</div>
//             <button className="nav-item" onClick={doLogout}>
//               <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>⏻</span>
//               Sign Out
//             </button>
//           </div>
//         </nav>

//         <div className="sidebar-bottom">
//           <div className="user-card">
//             <div className={`user-avatar ${meta.avatarClass}`}>
//               {user?.name?.[0] ?? '?'}
//             </div>
//             <div className="user-info">
//               <div className="user-name">{user?.name?.split(' ')[0] ?? 'User'}</div>
//               <div className="user-role">{meta.label}</div>
//             </div>
//           </div>
//         </div>
//       </aside>

//       <div className="main-area">
//         <header className="topbar">
//           <div className="topbar-left">
//             <h1>{pageInfo.title}</h1>
//             <p>{pageInfo.sub}</p>
//           </div>
//           <div className="topbar-right">
//             <div className="topbar-date">{dateStr}</div>

//             <button
//               className="theme-toggle"
//               onClick={toggleTheme}
//               title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
//               aria-label="Toggle theme"
//             >
//               <span className={`theme-toggle-knob ${theme}`}>
//                 {theme === 'light' ? '☀️' : '🌙'}
//               </span>
//             </button>

//             <div className="notif-btn">
//               <button className="btn-icon" title="Notifications">🔔</button>
//               {pendingCount > 0 && <span className="notif-dot" />}
//             </div>
//           </div>
//         </header>

//         <main className="page-content animate-fadein">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }

// src/layouts/AppLayout.jsx

export default function AppLayout({ children, pendingCount = 0 }) {
  const { user, logout }       = useAuth()
  const toast                  = useToast()
  const navigate               = useNavigate()
  const location               = useLocation()
  const { theme, toggleTheme } = useTheme()

  // FIX: use user_type instead of role
  const navItems = NAVS[user?.user_type] ?? []
  const meta     = ROLE_META[user?.user_type] ?? {}

  const pageInfo = TITLES[location.pathname] ?? { title: 'TiffinOS', sub: '' }

  const doLogout = () => {
    logout()
    toast.info('Signed out successfully')
    navigate('/login')
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-mark">🍱</div>
            <div className="logo-text">Tiffin<span>OS</span></div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>

            {navItems.map(item => (
              <button
                key={item.path}
                className={`nav-item ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>
                  {item.icon}
                </span>

                {item.label}

                {item.badge === 'live' && pendingCount > 0 && (
                  <span className="nav-badge">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">System</div>

            <button className="nav-item" onClick={doLogout}>
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>
                ⏻
              </span>
              Sign Out
            </button>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className={`user-avatar ${meta.avatarClass}`}>
              {user?.username?.[0] ?? '?'}
            </div>

            <div className="user-info">
              <div className="user-name">
                {user?.username ?? 'User'}
              </div>

              <div className="user-role">{meta.label}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.sub}</p>
          </div>

          <div className="topbar-right">
            <div className="topbar-date">{dateStr}</div>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label="Toggle theme"
            >
              <span className={`theme-toggle-knob ${theme}`}>
                {theme === 'light' ? '☀️' : '🌙'}
              </span>
            </button>

            <div className="notif-btn">
              <button className="btn-icon" title="Notifications">
                🔔
              </button>

              {pendingCount > 0 && <span className="notif-dot" />}
            </div>
          </div>
        </header>

        <main className="page-content animate-fadein">
          {children}
        </main>
      </div>
    </div>
  )
}
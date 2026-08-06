# PULSE Platform - Routing & Navigation Guide

## Application Structure

PULSE uses a single-page application (SPA) architecture with client-side routing managed through React context.

### View Types

The application supports 9 different views:

```typescript
type View = 'home' | 'dashboard' | 'invest' | 'sale' | 'stake' | 'signals' | 'wallet' | 'profile' | 'admin'
```

---

## Navigation Structure

### Bottom Navigation (Main Navigation)

Located in `components/pulse/bottom-nav.tsx`, provides quick access to all views:

| View | Label | Icon | Purpose |
|------|-------|------|---------|
| `home` | Welcome | House | Premium landing page |
| `dashboard` | Dashboard | Layers | Portfolio overview |
| `invest` | Invest | Sparkles | Make new investments |
| `signals` | Signals | Radio | Browse investment signals |
| `wallet` | Wallet | Wallet | Manage funds |
| `profile` | Profile | User | User settings |
| `admin` | Admin | ShieldCheck | Admin panel (pwd protected) |

### View Components

Located in `components/pulse/views/`:

- `home.tsx` - Premium welcome/landing page
- `dashboard.tsx` - Portfolio dashboard
- `invest.tsx` - Investment interface
- `sale.tsx` - Token sale
- `stake.tsx` - Staking interface
- `signals.tsx` - Investment signals browser
- `wallet.tsx` - Wallet management
- `profile.tsx` - User profile
- `admin.tsx` - Admin dashboard (enhanced with CRUD)

---

## Navigation Flow

### User Landing

```
User visits app
    ↓
Home View (Welcome page)
    ├─ [Explore Opportunities] → Signals View
    ├─ [Your Dashboard] → Dashboard View
    └─ [Create Account] → Dashboard View
```

### Investor Journey

```
Home View
    ↓
Dashboard View (Portfolio overview)
    ├─ [Invest] → Invest View (modal)
    ├─ [Signals] → Signals View
    ├─ [Wallet] → Wallet View (deposit/withdraw)
    ├─ [Sale] → Sale View (buy PULSE tokens)
    ├─ [Stake] → Stake View
    └─ [Profile] → Profile View (settings)
```

### Admin Workflow

```
Any View
    ↓
Bottom Nav [Admin] button
    ↓
Admin Auth Screen
    ├─ Enter password (pulse-admin)
    ├─ [Unlock] → Admin Dashboard
    │
    └─ Admin Dashboard (Tabbed Interface)
        ├─ Dashboard Tab
        │  ├─ Stats & metrics
        │  └─ Pending approvals
        │
        ├─ Signals Tab
        │  ├─ Create new signal
        │  ├─ Edit signal
        │  └─ Delete signal
        │
        ├─ Projects Tab
        │  ├─ Create new project
        │  ├─ Edit project
        │  └─ Delete project
        │
        └─ Payments Tab
           ├─ Withdrawal approval queue
           ├─ Deposit approvals
           └─ Payment history
```

---

## How Navigation Works

### Router Implementation

Navigation uses React Context (no Next.js Router):

```typescript
// In any component:
import { usePulse } from '@/components/pulse/store'

export function MyComponent() {
  const { view, setView } = usePulse()
  
  return (
    <button onClick={() => setView('signals')}>
      Go to Signals
    </button>
  )
}
```

### View Rendering

The `PulseApp` component renders views based on current view state:

```typescript
function Screen() {
  const { view } = usePulse()
  return (
    <>
      {view === 'home' && <HomeView />}
      {view === 'dashboard' && <DashboardView />}
      {view === 'signals' && <SignalsView />}
      {/* ... etc ... */}
    </>
  )
}
```

---

## Programmatic Navigation

### From Home Page

```typescript
const { dispatch } = usePulse()

// Navigate to signals
dispatch({ type: 'SET_VIEW', view: 'signals' })

// Navigate to dashboard
dispatch({ type: 'SET_VIEW', view: 'dashboard' })
```

### From Components

```typescript
import { usePulse } from '@/components/pulse/store'

export function InvestmentCard() {
  const { setView } = usePulse()
  
  return (
    <button onClick={() => setView('invest')}>
      Invest Now
    </button>
  )
}
```

### From Modals

```typescript
export function KycModal() {
  const { closeModal, setView } = usePulse()
  
  const onComplete = () => {
    closeModal()
    setView('dashboard') // Navigate after modal closes
  }
  
  return <Dialog onComplete={onComplete} />
}
```

---

## Admin Access

### Password Protection

Admin view is protected with password:
- **Password:** `pulse-admin`
- **Location:** `components/pulse/views/admin.tsx`
- Change password in code to secure it

### Admin Tabs

Once authenticated, admin can access 4 tabs:

1. **Dashboard Tab**
   - View platform statistics
   - Approve pending transactions
   - View yield disbursements

2. **Signals Tab**
   - Create new investment signals
   - Edit existing signals
   - Delete signals
   - View all active signals

3. **Projects Tab**
   - Create new investment projects
   - Edit project details
   - Delete projects
   - Track project funding

4. **Payments Tab**
   - Approve/reject withdrawals
   - View payment history
   - Track fund movements

---

## Signal Management Routing

### Signal Creation Flow

```
Admin View → Signals Tab
    ↓
[Create Signal] Form
    ├─ Select Project
    ├─ Enter Title
    ├─ Enter Detail
    ├─ Set Yield
    ├─ Set Urgency
    ├─ Set Window
    └─ [Create] → Signal Created → Signal appears in Signals View
```

### Signal Auto-Close Routing

```
Signal Closing Date Reached
    ↓
Auto-close system triggers
    ↓
Admin receives email notification
    ↓
Admin → Admin View → Payments Tab
    ↓
Approve Credits
    ↓
Investors receive emails
    ↓
Credits appear in investor wallets
```

---

## Project Management Routing

### Project Creation Flow

```
Admin View → Projects Tab
    ↓
[Create Project] Form
    ├─ Enter Name
    ├─ Enter Country
    ├─ Select Sector
    ├─ Enter Yield
    ├─ Enter Goal
    ├─ Select Risk
    ├─ Enter Summary
    └─ [Create] → Project Created → Project appears in Projects Tab
```

### Project Usage in Signals

```
Create Signal
    ↓
Select Project dropdown
    ↓
All created projects appear in list
    ↓
Signal linked to project
    ↓
Investors see signals linked to projects
```

---

## URL Structure

### Local Development

- **Main App:** `http://localhost:3000`
- **Home View:** `http://localhost:3000/#/home`
- **Dashboard:** `http://localhost:3000/#/dashboard`
- **Admin:** `http://localhost:3000/#/admin`

### Production (pulse-invest.vercel.app)

- **Main App:** `https://pulse-invest.vercel.app`
- **Views:** Use bottom navigation (no URL structure)

---

## Keyboard Navigation

### Shortcuts

| Key | Action |
|-----|--------|
| `1` | Go to Home |
| `2` | Go to Dashboard |
| `3` | Go to Invest |
| `4` | Go to Signals |
| `5` | Go to Wallet |
| `6` | Go to Profile |
| `9` | Go to Admin |

(Implement as optional enhancement)

---

## Mobile Navigation

### Responsive Design

- Bottom nav stays visible on all screen sizes
- Scrollable view area
- Safe area insets for notches
- Touch-optimized button sizes (44x44px minimum)

### Small Screen Behavior

- 7 navigation items in bottom nav
- Single column layouts
- Full-width modals
- Drawer navigation (expandable)

---

## Navigation Best Practices

### For Developers

1. **Always use `setView()`** for navigation
   ```typescript
   const { setView } = usePulse()
   setView('dashboard')
   ```

2. **Close modals before navigating**
   ```typescript
   const { closeModal, setView } = usePulse()
   closeModal()
   setView('invest')
   ```

3. **Handle admin protection**
   ```typescript
   // Admin view handles auth internally
   // No need to check elsewhere
   ```

4. **Provide clear navigation options**
   ```typescript
   // Always show bottom nav
   // Provide CTA buttons to navigate
   ```

### For Users

1. **Use bottom navigation** to switch views
2. **Click buttons** for secondary navigation
3. **Admin access** requires password
4. **Back button** (if needed) uses browser history

---

## Troubleshooting Navigation

### View not switching
- Check if `setView()` is being called
- Verify view name matches `View` type
- Check browser console for errors
- Ensure component is wrapped in `PulseProvider`

### Admin not accessible
- Check password is correct (pulse-admin)
- Verify you're accessing admin view from bottom nav
- Look for "Admin" button in bottom navigation

### Signal/Project not appearing
- Refresh the page
- Check in admin dashboard where they were created
- Verify they were successfully created (toast notification)
- Check browser console for errors

---

## Summary

✅ Navigation system complete
✅ Home view integrated
✅ Admin panel with CRUD
✅ Bottom navigation updated
✅ Signal management routing
✅ Project management routing
✅ Auto-close notifications
✅ Mobile responsive

Your app is now fully routed and ready for use!

Start at Home View → Navigate to Dashboard → Explore Signals → Invest → Check Admin Panel

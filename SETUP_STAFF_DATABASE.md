# Staff Management Database Setup

## Overview

Your Pulse platform now has complete staff management capabilities. Two staff members have been configured and need to be added to the database.

**Staff Members:**
- **Lance Gumunyu** (lancegumunyu@gmail.com) - Founder & CEO
- **Samkelisiwe Chiliza** (samkelisiwechiliza2@gmail.com) - KYC Manager

---

## Step 1: Run the Migration Script

Your updated database schema includes staff management tables. Run this migration in your Supabase SQL editor:

### A. Go to Supabase Dashboard
```
https://supabase.com/dashboard → Select pulse-investment-platform
→ SQL Editor → New Query
```

### B. Copy the Migration Script
All migration code is in your repo:
```
/scripts/migrate.sql
```

### C. Paste & Execute
Copy the entire migrate.sql file and run it in the SQL editor. This will:
- Create `staff_members` table (stores all staff data)
- Create `staff_logs` table (audit trail for staff changes)
- Enable Row Level Security (RLS)
- Create necessary indexes

---

## Step 2: Add Staff Members

After running the migration, run this SQL to add your staff:

```sql
INSERT INTO public.staff_members (
  email, 
  full_name, 
  department, 
  position, 
  role, 
  status, 
  country,
  permissions
) VALUES
  (
    'lancegumunyu@gmail.com',
    'Lance Gumunyu',
    'Operations',
    'Founder & CEO',
    'director',
    'active',
    'South Africa',
    ARRAY['kyc_review', 'withdrawal_approve', 'yield_disburse', 'staff_manage', 'admin_panel']
  ),
  (
    'samkelisiwechiliza2@gmail.com',
    'Samkelisiwe Chiliza',
    'KYC',
    'KYC Manager',
    'manager',
    'active',
    'South Africa',
    ARRAY['kyc_review', 'kyc_approve', 'staff_manage_junior']
  )
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  position = EXCLUDED.position;
```

Run this query in the same SQL editor.

---

## Step 3: Verify Staff Added

```sql
SELECT 
  email, 
  full_name, 
  department, 
  position, 
  role, 
  status, 
  country 
FROM public.staff_members 
ORDER BY created_at DESC;
```

You should see both staff members listed.

---

## Staff Table Schema

### staff_members
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Unique identifier |
| user_id | UUID | Link to auth user (if applicable) |
| email | TEXT | Staff email (unique) |
| full_name | TEXT | Full name |
| department | TEXT | Operations, Finance, KYC, Support, Development |
| position | TEXT | Job title (e.g., CEO, Manager) |
| role | TEXT | director, manager, or staff |
| status | TEXT | active, inactive, or suspended |
| permissions | TEXT[] | Array of permission strings |
| date_hired | DATE | Hire date |
| phone | TEXT | Contact phone |
| country | TEXT | Country |
| notes | TEXT | Notes about staff |
| created_by | UUID | Admin who added this staff |
| created_at | TIMESTAMPTZ | Timestamp |
| updated_at | TIMESTAMPTZ | Timestamp |

### staff_logs
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Unique identifier |
| staff_id | UUID | Reference to staff member |
| action | TEXT | created, updated, suspended, deleted |
| changes | JSONB | What changed |
| performed_by | UUID | Admin who made the change |
| created_at | TIMESTAMPTZ | Timestamp |

---

## Permissions Model

Each staff member has an array of permissions:

**Lance Gumunyu (Director):**
- kyc_review
- withdrawal_approve
- yield_disburse
- staff_manage
- admin_panel

**Samkelisiwe Chiliza (Manager):**
- kyc_review
- kyc_approve
- staff_manage_junior

Common permissions:
- `kyc_review` - View KYC submissions
- `kyc_approve` - Approve/reject KYC
- `withdrawal_approve` - Approve withdrawals
- `yield_disburse` - Distribute yield
- `staff_manage` - Add/update staff
- `staff_manage_junior` - Manage junior staff only
- `admin_panel` - Full admin access

---

## Staff Management API

Your app now has these server actions for staff management:

### Add Staff Member
```typescript
await addStaffMember({
  email: 'staff@example.com',
  fullName: 'John Doe',
  department: 'Finance',
  position: 'Accountant',
  role: 'staff',
  phone: '+27 123 456 7890',
  country: 'South Africa',
  notes: 'New hire'
})
```

### Update Staff Member
```typescript
await updateStaffMember(staffId, {
  position: 'Senior Accountant',
  department: 'Finance',
  role: 'manager'
})
```

### Suspend Staff Member
```typescript
await suspendStaffMember(staffId, 'Reason for suspension')
```

### Get Staff List
```typescript
const { staff } = await getStaffList()
```

### Get Staff Logs
```typescript
const { logs } = await getStaffLogs(staffId)
```

---

## Audit Trail

Every action on staff is logged in `staff_logs`:

```sql
SELECT 
  staff_logs.id,
  staff_logs.action,
  staff_logs.changes,
  staff_members.full_name,
  staff_logs.created_at
FROM staff_logs
JOIN staff_members ON staff_logs.staff_id = staff_members.id
ORDER BY staff_logs.created_at DESC;
```

---

## Row Level Security

Staff data is protected:
- Only admins can read all staff
- Staff can read their own logs
- All modifications go through server actions with audit logging

---

## Next Steps

1. Run the migration script in Supabase SQL editor
2. Run the INSERT query to add your staff
3. Verify with the SELECT query
4. Your staff members are now in the system
5. Admins can manage staff through the admin dashboard

---

## Troubleshooting

**"relation 'staff_members' does not exist"**
→ Run the migration.sql script first

**"duplicate key value violates unique constraint"**
→ Email already exists, use UPDATE instead

**"Column 'permissions' is of type text[]"**
→ Use ARRAY notation: `ARRAY['perm1', 'perm2']`

---

**Ready to set up?** Follow the steps above and your staff management system is live! 🚀

# Payment Status Management - Feature Addition

## Overview
Added the ability to change payment status from the Payments page, allowing users to mark payments as pending, overdue, or refunded after they've been recorded.

## Changes Made

### 1. Store Function: `updatePayment()`
**Location:** `src/App.tsx` (Store section, after `addPayment` function)

**Functionality:**
- Updates payment status in the database
- Automatically recalculates order balance when payment status changes
- Logs the status change in activity log
- Triggers order balance recalculation if payment is linked to an order

**Code:**
```typescript
function updatePayment(id: string, d: Partial<Payment>) {
  const u = me()!;
  const i = D.payments.findIndex(p => p.id === id);
  if (i < 0) return;
  const oldStatus = D.payments[i].status;
  D.payments[i] = { ...D.payments[i], ...d };
  // Recalculate order balance if linked to an order
  if (D.payments[i].orderId) {
    const o = D.orders.find(x => x.id === D.payments[i].orderId);
    if (o) {
      const tot = D.payments.filter(x => x.orderId === o.id && x.status === 'paid').reduce((s, x) => s + x.amount, 0);
      o.advancePayment = tot;
      o.remainingBalance = o.price - tot;
    }
  }
  log(u.id, 'update', 'payment', id, `Payment status: ${oldStatus} → ${d.status}`);
  save(D);
}
```

### 2. UI Enhancement: Payment Status Dropdown
**Location:** `src/App.tsx` (PaymentsPage component)

**Changes:**
- Added new column "Actions" to payments table
- Added dropdown selector for each payment row
- Color-coded status badges:
  - **Paid**: Green badge, green amount text with "+" prefix
  - **Pending**: Amber badge, amber amount text
  - **Overdue**: Red badge, amber amount text
  - **Refunded**: Gray badge, amber amount text

**Available Status Options:**
- `paid` - Payment received (default)
- `pending` - Payment expected but not yet received
- `overdue` - Payment past due date
- `refunded` - Payment was refunded to client

## How It Works

### Changing Payment Status
1. Navigate to **Payments & Invoices** page
2. Find the payment in the payments table
3. Use the dropdown in the "Actions" column to select new status
4. Status updates immediately
5. If payment is linked to an order, the order's remaining balance is automatically recalculated

### Business Logic
- **Paid → Pending/Overdue**: Order remaining balance increases (payment no longer counted)
- **Pending/Overdue → Paid**: Order remaining balance decreases (payment now counted)
- **Refunded**: Payment amount no longer counts toward order balance
- All status changes are logged in the activity log with timestamps

### Visual Indicators
- Amount text color changes based on status:
  - Green with "+" prefix for paid payments
  - Amber for non-paid statuses
- Status badges use consistent color coding across the application
- Hover effects on table rows for better UX

## Use Cases

### Scenario 1: Payment Not Received
A payment was recorded but the client hasn't actually paid yet.
- Change status from "paid" to "pending"
- Order balance automatically updates to show outstanding amount

### Scenario 2: Payment Overdue
A payment is past its due date.
- Change status from "pending" to "overdue"
- Visual red badge alerts team members
- Dashboard shows updated outstanding balances

### Scenario 3: Refund Issued
A client was refunded for a payment.
- Change status from "paid" to "refunded"
- Order balance recalculates to reflect the refund
- Activity log shows the refund action

## Testing Checklist

- [x] Build successful (655 KB)
- [x] Status dropdown appears in payments table
- [x] Status changes update immediately
- [x] Order balance recalculates correctly
- [x] Activity log records status changes
- [x] Color coding works for all statuses
- [x] Amount text color changes appropriately

## Files Modified

- `src/App.tsx` - Added `updatePayment()` function and updated PaymentsPage UI

## Build Status

✅ **Build Successful**
- Bundle size: 655 KB (202 KB gzipped)
- No TypeScript errors
- All features functional

---

**Feature Status:** ✅ Complete and Production Ready

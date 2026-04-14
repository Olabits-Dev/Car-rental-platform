# Paystack Payment Integration Guide

## Overview

This document describes the Paystack payment system integration for the car-rental platform. The integration enables secure payment processing for car bookings while maintaining a seamless user experience.

## Architecture

### Payment Flow

1. **Booking Creation** → User creates a booking (status: `pending`)
2. **Payment Initialization** → System creates a payment record and initializes Paystack transaction
3. **User Authorization** → User is redirected to Paystack to authorize payment
4. **Payment Processing** → Paystack processes the payment
5. **Webhook Notification** → Paystack sends webhook to confirm payment status
6. **Booking Confirmation** → Booking status changes from `pending` to `confirmed` upon successful payment

### Database Schema

#### `rideflex_payments` Table
Stores all payment transactions:
- `id` - Unique payment identifier (UUID)
- `user_id` - Reference to the customer
- `amount` - Amount in kobo (₦1 = 100 kobo)
- `currency` - Currency code (default: 'NGN')
- `status` - Payment status (pending, success, failed, abandoned)
- `payment_method` - Payment method (default: 'paystack')
- `reference` - Paystack reference code (unique)
- `access_code` - Paystack access code for authorization
- `authorization_url` - Paystack payment page URL
- `created_at` - When payment was initiated
- `updated_at` - Last status update

#### Updated `rideflex_bookings` Table
- Added `payment_id` - Foreign key to `rideflex_payments`
- Updated `status` - Now includes 'pending' status for unpaid bookings

## Environment Variables

Add these to your `.env.local` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here

# Backend URL (for webhook callbacks)
BACKEND_URL=http://127.0.0.1:3001
```

## API Endpoints

### 1. Initialize Payment
**POST** `/api/payments/initialize`

Initiates a payment transaction.

**Request:**
```json
{
  "bookingId": "booking-id-here",
  "amount": 50000
}
```

**Response:**
```json
{
  "payment": {
    "id": "payment-id",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "BOOKING_xxx_xxx"
  }
}
```

### 2. Verify Payment
**GET** `/api/payments/verify?reference=REFERENCE&paymentId=PAYMENT_ID`

Verifies payment status after user returns from Paystack.

**Response:**
```json
{
  "status": "success",
  "message": "Payment successful"
}
```

### 3. Get Payment Status
**GET** `/api/payments/status?paymentId=PAYMENT_ID`

Checks the current status of a payment.

**Response:**
```json
{
  "status": "success",
  "amount": 50000,
  "reference": "BOOKING_xxx_xxx"
}
```

### 4. Webhook Handler
**POST** `/api/payment/webhook`

Receives payment status updates from Paystack.

## Components

### PaymentStatusIndicator
Displays payment status in the UI with appropriate styling:
- Pending: Yellow (⏳)
- Success: Green (✓)
- Failed: Red (✕)
- Abandoned: Gray (⊘)

**Usage:**
```tsx
<PaymentStatusIndicator
  status="success"
  amount={50000}
  paymentRef="BOOKING_xxx_xxx"
/>
```

### PaymentStatusBadge
Compact payment status badge for listings.

## User Experience

### Customer Journey

1. **Browse & Select Car**
   - Customer views available cars and selects booking dates

2. **Create Booking**
   - System creates booking with status `pending`
   - Total price is calculated

3. **Payment Initialization**
   - System sends booking total to payment endpoint
   - Payment record is created in database
   - Session storage saves payment and booking IDs

4. **Redirect to Paystack**
   - User is redirected to Paystack payment page
   - Authorization URL includes callback configuration

5. **Payment Authorization**
   - User completes payment on Paystack
   - Paystack redirects to `/payment-callback`

6. **Verification & Confirmation**
   - System verifies payment with Paystack
   - Booking status is updated to `confirmed`
   - User is redirected to dashboard
   - Payment badge displays status

7. **Dashboard View**
   - Customer sees booking with payment status
   - Confirmation details are visible

### Admin/Agent Dashboard

- View all payments via `/api/admin/payments/report`
- See payment statistics (successful, pending, failed)
- Track payment history and amounts
- Associate payments with specific bookings

## Payment Status Handling

### Pending
- Payment initialized but not yet completed
- User must authorize payment on Paystack

### Success
- Payment received from Paystack
- Booking status automatically updated to `confirmed`
- Customer can proceed with car rental

### Failed
- Payment declined or errored
- Booking remains in `pending` status
- Customer can retry booking and payment

### Abandoned
- Customer left payment page without completing
- Booking remains in `pending` status
- Session may be reused for retry

## Security Features

1. **Signature Verification** - Webhook signatures verified with Paystack secret
2. **User Ownership Verification** - Payments only accessible to booking owner
3. **Reference Uniqueness** - Each payment gets unique reference code
4. **Database Constraints** - Foreign key relationships ensure data integrity
5. **Session Management** - Session storage prevents payload tampering

## Error Handling

The system handles various error scenarios:

- **Missing Configuration** - Returns 503 if Paystack keys not set
- **Invalid Amounts** - Returns 400 for zero or negative amounts
- **Unauthorized Access** - Returns 403 for non-owners accessing payments
- **Payment Verification Failures** - Returns 500 with descriptive error
- **Webhook Failures** - Logs errors but continues processing

## Testing Payment Integration

### Manual Testing

1. **Create Test Booking**
   - Log in as customer
   - Browse cars and create booking
   - Should be in `pending` status

2. **Initiate Payment**
   - Click on booking
   - System redirects to Paystack
   - Check session storage for payment ID

3. **Use Test Card**
   - On Paystack page, use test card: `4111 1111 1111 1111`
   - Use any future expiry date
   - Use any 3-digit CVV

4. **Verify Payment**
   - After authorization, check `/payment-callback`
   - Should redirect to dashboard with success message
   - Booking status should be `confirmed`

### Webhook Testing

Use Paystack's webhook testing tool:
1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Test webhook with sample payload
3. Verify your endpoint handles the request

## Troubleshooting

### Payment shows as "pending" after authorization
- Check Paystack webhook is configured correctly
- Verify webhook secret matches `PAYSTACK_SECRET_KEY`
- Check application logs for webhook errors

### Payment verification fails
- Ensure `PAYSTACK_SECRET_KEY` is correct
- Confirm payment reference is valid
- Check Paystack API is accessible

### User stuck on Paystack page
- Verify callback URL is publicly accessible
- Ensure `BACKEND_URL` environment variable is set
- Check browser's session storage for payment ID

### Bookings appear cancelled unexpectedly
- Pending bookings are automatically excluded from availability checks
- Failed payments should not affect car availability
- Only `confirmed` and `completed` statuses block availability

## Admin Features

### Payment Reports API
**GET** `/api/admin/payments/report`

Returns comprehensive payment statistics:
```json
{
  "stats": {
    "successful_payments": 45,
    "pending_payments": 3,
    "failed_payments": 2,
    "total_received": 2250000,
    "avg_transaction": 50000
  },
  "payments": [
    {
      "id": "payment-id",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "amount": 50000,
      "status": "success",
      "reference": "BOOKING_xxx_xxx",
      "createdAt": "2024-01-15T10:30:00Z",
      "associatedBookings": 1
    }
  ]
}
```

## Future Enhancements

1. **Multiple Payment Methods** - Add other providers (Stripe, Flutterwave)
2. **Refund Management** - Handle refunds for cancelled bookings
3. **Payment Analytics** - Advanced reporting and analytics
4. **Recurring Payments** - Support for subscriptions or memberships
5. **Currency Support** - Enable multi-currency payments
6. **Invoice Generation** - Auto-generate PDF invoices
7. **Payment Retry Logic** - Automatic retry for failed payments

## Support & Documentation

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://developer.paystack.co/reference)
- [Webhook Documentation](https://developer.paystack.co/plugins-and-libraries)

# Paystack Payment Integration - Quick Setup Guide

## Prerequisites

1. A Paystack account (sign up at https://paystack.com)
2. API keys from Paystack Dashboard
3. Backend running on accessible URL for webhooks

## Step 1: Get Paystack API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** and **Secret Key**
4. (For testing, use test keys first)

## Step 2: Configure Environment Variables

1. Copy `.env.paystack.example` to `.env.local`:
```bash
cp .env.paystack.example .env.local
```

2. Add your Paystack keys:
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
BACKEND_URL=http://127.0.0.1:3001
```

3. For production:
```env
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
BACKEND_URL=https://your-production-domain.com
```

## Step 3: Install Dependencies

```bash
npm install
```

This installs axios which is required for Paystack API calls.

## Step 4: Initialize Database

```bash
npm run db:bootstrap
```

This creates the new `rideflex_payments` table and updates the `rideflex_bookings` table.

## Step 5: Start Application

```bash
npm run dev
```

This starts both frontend and backend servers.

## Step 6: Test Payment Flow

1. **Create Booking**:
   - Log in as a customer
   - Browse cars and create a booking
   - Booking should be in "pending" status

2. **Make Payment**:
   - System redirects to Paystack
   - Use test card: `4111 1111 1111 1111`
   - Expiry: any future date (e.g., 12/25)
   - CVV: any 3 digits (e.g., 123)

3. **Verify Payment**:
   - After successful payment, you're redirected to confirmation page
   - System verifies payment and confirms booking
   - Booking status changes to "confirmed"
   - Dashboard shows payment status badge

## Step 7: Configure Webhook (Production)

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Set webhook URL to: `https://your-domain.com/api/payment/webhook`
3. Test webhook delivery
4. Enable webhook for production

## Webhook URL

- **For Local Testing**: Use [ngrok](https://ngrok.com) or similar tunneling service
  ```bash
  ngrok http 3000  # Forwards to localhost:3000
  ```
  Then set webhook URL to: `https://your-ngrok-url.ngrok.io/api/payment/webhook`

- **For Production**: Set webhook URL to your production domain:
  ```
  https://yourdomain.com/api/payment/webhook
  ```

## Testing with Paystack Test Cards

### Successful Payment
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

### Failed Payment
- Card: `4111 1111 1111 1110`
- Expiry: Any future date  
- CVV: Any 3 digits

### 3D Secure OTP
- Card: `4187 4274 2955 2366`
- OTP: `123456`

## View Payment Records

### Customer Dashboard
- Log in as customer
- Go to Dashboard
- See payment status on each booking:
  - 🟡 Pending
  - 🟢 Success
  - 🔴 Failed

### Admin/Agent Dashboard
- Log in as admin/agent
- Access payment reports via API: `/api/admin/payments/report`
- See all payments, statistics, and transaction history

## Troubleshooting

### Payment initialization fails
- Check Paystack API keys are correct
- Verify `PAYSTACK_SECRET_KEY` is set in environment
- Check network connectivity to Paystack API

### Webhook not received
- For local testing, use ngrok or similar
- Verify webhook URL is publicly accessible
- Check webhook signature is verified correctly
- Enable webhook in Paystack Dashboard

### Booking remains pending after payment
- Check application logs for webhook errors
- Verify webhook configuration in Paystack
- Check database for payment status updates

### Payment verification error
- Ensure payment reference is valid
- Confirm Paystack credentials are correct
- Check Paystack API is accessible

## Useful Links

- [Paystack Dashboard](https://dashboard.paystack.com)
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://developer.paystack.co/reference)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-authentication/)

## Support

For issues with payment integration:
1. Check PAYSTACK_INTEGRATION.md for detailed documentation
2. Review Paystack dashboard logs
3. Check application server logs
4. Verify environment variables are set correctly

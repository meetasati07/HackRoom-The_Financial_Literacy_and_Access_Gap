# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for the HackWave FinTech platform.

## Prerequisites

- Node.js and npm installed
- MongoDB database running
- Razorpay account (test/live)

## Step 1: Create Razorpay Account

1. **Sign up for Razorpay**
   - Go to [https://razorpay.com](https://razorpay.com)
   - Click "Sign Up" and create your account
   - Verify your email and mobile number

2. **Complete KYC**
   - Log in to your Razorpay dashboard
   - Complete the KYC process (required for live payments)
   - Upload necessary documents (PAN, Aadhaar, Bank details)

3. **Get API Keys**
   - Go to Settings → API Keys
   - Generate new API keys
   - Copy the **Key ID** and **Key Secret**

## Step 2: Configure Environment Variables

### Backend Configuration

1. **Copy environment file**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Update `.env` file with Razorpay credentials**
   ```env
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id_here
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Frontend Configuration

1. **Update frontend environment**
   ```bash
   cd frontend
   cp env.example .env
   ```

2. **Add Razorpay Key ID to frontend `.env`**
   ```env
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
   ```

## Step 3: Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install razorpay express-validator
```

### Frontend Dependencies
The Razorpay script is already included in `index.html`. No additional packages needed.

## Step 4: Set Up Webhooks (Optional but Recommended)

1. **Configure Webhook in Razorpay Dashboard**
   - Go to Settings → Webhooks
   - Click "Add New Webhook"
   - Set Webhook URL: `https://yourdomain.com/api/transactions/webhook`
   - Select Events:
     - `payment.captured`
     - `payment.failed`
   - Generate webhook secret and add to `.env`

2. **Test Webhook Locally (using ngrok)**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Start your backend server
   cd backend
   npm run dev
   
   # In another terminal, expose your local server
   ngrok http 5000
   
   # Use the ngrok URL for webhook configuration
   ```

## Step 5: Database Setup

The transaction model will be automatically created when you start the server. No manual setup required.

## Step 6: Test the Integration

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Start the Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Test Payment Flow
1. Register/Login to the application
2. Go to Money Management → Transactions
3. Click "Add Transaction"
4. Fill in transaction details
5. Complete the Razorpay payment flow
6. Verify transaction appears in history

## Step 7: Production Deployment

### 1. Update Environment Variables
- Use live Razorpay API keys
- Update webhook URL to production domain
- Set `NODE_ENV=production`

### 2. Security Considerations
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Implement proper error handling and logging

### 3. Monitoring
- Set up monitoring for failed payments
- Monitor webhook delivery
- Track transaction success rates

## API Endpoints

### Transaction Management
- `POST /api/transactions/create-order` - Create Razorpay order
- `POST /api/transactions/verify-payment` - Verify payment and save transaction
- `GET /api/transactions` - Get user transactions with filters
- `GET /api/transactions/analytics` - Get spending analytics
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions/webhook` - Razorpay webhook handler

### Query Parameters for GET /api/transactions
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `category` - Filter by category
- `status` - Filter by status (pending, completed, failed, cancelled)
- `paymentMethod` - Filter by payment method
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)

## Transaction Categories

The system supports the following transaction categories:
- `food` - Food & Dining
- `entertainment` - Entertainment
- `travel` - Travel
- `shopping` - Shopping
- `savings` - Savings
- `insurance` - Insurance
- `emergency` - Emergency
- `misc` - Miscellaneous
- `bills` - Bills
- `healthcare` - Healthcare
- `education` - Education
- `transport` - Transport
- `utilities` - Utilities
- `subscriptions` - Subscriptions

## Payment Methods

Supported payment methods:
- `upi` - UPI payments
- `card` - Credit/Debit cards
- `netbanking` - Net banking
- `wallet` - Digital wallets
- `emi` - EMI payments

## Error Handling

The system includes comprehensive error handling:
- Payment verification failures
- Network errors
- Invalid signatures
- Duplicate transactions
- Database errors

## Testing

### Test Cards (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs
- `success@razorpay`
- `failure@razorpay`

## Troubleshooting

### Common Issues

1. **"Invalid Key ID" Error**
   - Check if RAZORPAY_KEY_ID is correct
   - Ensure you're using the right environment (test/live)

2. **"Signature Verification Failed"**
   - Verify RAZORPAY_KEY_SECRET is correct
   - Check if webhook secret matches

3. **Payment Window Not Opening**
   - Check if Razorpay script is loaded
   - Verify popup blockers are disabled
   - Check browser console for errors

4. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Ensure HTTPS is enabled in production

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=razorpay:*
```

## Support

For additional help:
- Razorpay Documentation: [https://razorpay.com/docs](https://razorpay.com/docs)
- Razorpay Support: [https://razorpay.com/support](https://razorpay.com/support)
- Check application logs for detailed error messages

## Security Best Practices

1. **API Key Security**
   - Never expose API keys in frontend code
   - Use environment variables
   - Rotate keys regularly

2. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS for webhook URLs
   - Implement idempotency

3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper access controls
   - Regular security audits

## Cost Considerations

- Razorpay charges 2% + GST per successful transaction
- No setup fees or monthly charges
- Refund processing fees may apply
- Check current pricing on Razorpay website

---

**Note**: This integration is designed for Indian market and supports INR currency only. For international payments, additional configuration may be required.

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Check if required environment variables are set
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials not found! Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
  console.error('Current values:');
  console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
  console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
}

// Razorpay configuration
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Verify Razorpay signature
export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

// Create Razorpay order
export const createRazorpayOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes: any = {}
) => {
  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt,
    notes,
    payment_capture: 1, // Auto capture payment
  };

  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Razorpay API timeout')), 10000); // 10 second timeout
    });

    const orderPromise = razorpay.orders.create(options);
    const order = await Promise.race([orderPromise, timeoutPromise]);
    
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order creation failed',
    };
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('Razorpay payment fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment fetch failed',
    };
  }
};

// Refund payment
export const refundPayment = async (
  paymentId: string,
  amount?: number,
  notes?: any
) => {
  try {
    const refundOptions: any = {
      payment_id: paymentId,
    };

    if (amount) {
      refundOptions.amount = amount * 100; // Amount in paise
    }

    if (notes) {
      refundOptions.notes = notes;
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error('Razorpay refund error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed',
    };
  }
};

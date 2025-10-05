"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPayment = exports.getPaymentDetails = exports.createRazorpayOrder = exports.verifyRazorpaySignature = exports.razorpay = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Razorpay credentials not found! Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
    console.error('Current values:');
    console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
    console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
}
exports.razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    return expectedSignature === razorpaySignature;
};
exports.verifyRazorpaySignature = verifyRazorpaySignature;
const createRazorpayOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
    const options = {
        amount: amount * 100,
        currency,
        receipt,
        notes,
        payment_capture: 1,
    };
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Razorpay API timeout')), 10000);
        });
        const orderPromise = exports.razorpay.orders.create(options);
        const order = await Promise.race([orderPromise, timeoutPromise]);
        return {
            success: true,
            order,
        };
    }
    catch (error) {
        console.error('Razorpay order creation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Order creation failed',
        };
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
const getPaymentDetails = async (paymentId) => {
    try {
        const payment = await exports.razorpay.payments.fetch(paymentId);
        return {
            success: true,
            payment,
        };
    }
    catch (error) {
        console.error('Razorpay payment fetch error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment fetch failed',
        };
    }
};
exports.getPaymentDetails = getPaymentDetails;
const refundPayment = async (paymentId, amount, notes) => {
    try {
        const refundOptions = {
            payment_id: paymentId,
        };
        if (amount) {
            refundOptions.amount = amount * 100;
        }
        if (notes) {
            refundOptions.notes = notes;
        }
        const refund = await exports.razorpay.payments.refund(paymentId, refundOptions);
        return {
            success: true,
            refund,
        };
    }
    catch (error) {
        console.error('Razorpay refund error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Refund failed',
        };
    }
};
exports.refundPayment = refundPayment;
//# sourceMappingURL=razorpay.js.map
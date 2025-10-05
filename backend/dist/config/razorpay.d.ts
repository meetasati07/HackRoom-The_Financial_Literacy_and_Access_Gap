import Razorpay from 'razorpay';
export declare const razorpay: Razorpay;
export declare const verifyRazorpaySignature: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => boolean;
export declare const createRazorpayOrder: (amount: number, currency: string | undefined, receipt: string, notes?: any) => Promise<{
    success: boolean;
    order: unknown;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    order?: undefined;
}>;
export declare const getPaymentDetails: (paymentId: string) => Promise<{
    success: boolean;
    payment: import("razorpay/dist/types/payments").Payments.RazorpayPayment;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    payment?: undefined;
}>;
export declare const refundPayment: (paymentId: string, amount?: number, notes?: any) => Promise<{
    success: boolean;
    refund: import("razorpay/dist/types/refunds").Refunds.RazorpayRefund;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    refund?: undefined;
}>;
//# sourceMappingURL=razorpay.d.ts.map
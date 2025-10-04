import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Plus, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Calendar,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface AddTransactionModalProps {
  onTransactionAdded: () => void;
  language: any;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onTransactionAdded, language }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    merchant: '',
    paymentMethod: '',
    metadata: {
      upiId: '',
      bankName: '',
      cardLast4: '',
      cardType: '',
      walletName: ''
    }
  });
  const [razorpayData, setRazorpayData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const categories = [
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'savings', label: 'Savings', icon: '💰' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'misc', label: 'Miscellaneous', icon: '📦' },
    { value: 'bills', label: 'Bills', icon: '📄' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'subscriptions', label: 'Subscriptions', icon: '📱' }
  ];

  const paymentMethods = [
    { value: 'upi', label: 'UPI', icon: Smartphone, description: 'Pay using UPI ID' },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Pay using card' },
    { value: 'netbanking', label: 'Net Banking', icon: Building2, description: 'Pay using net banking' },
    { value: 'wallet', label: 'Digital Wallet', icon: Wallet, description: 'Pay using wallet' },
    { value: 'emi', label: 'EMI', icon: Calendar, description: 'Pay in installments' }
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCreateOrder = async () => {
    if (!formData.amount || !formData.description || !formData.category || !formData.merchant || !formData.paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus('processing');

      const response = await apiService.createTransactionOrder({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        merchant: formData.merchant,
        paymentMethod: formData.paymentMethod,
        metadata: formData.metadata
      });

      if (response.success && response.data) {
        setRazorpayData(response.data);
        setStep(2);
        initializeRazorpay(response.data);
      } else {
        toast.error(response.message || 'Failed to create payment order');
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error('Failed to create payment order');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = (orderData: any) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'HackWave',
      description: formData.description,
      order_id: orderData.orderId,
      handler: async (response: any) => {
        try {
          setLoading(true);
          const verifyResponse = await apiService.verifyTransaction({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            description: formData.description,
            category: formData.category,
            merchant: formData.merchant,
            paymentMethod: formData.paymentMethod,
            metadata: formData.metadata
          });

          if (verifyResponse.success) {
            setPaymentStatus('success');
            toast.success('Transaction completed successfully!');
            onTransactionAdded();
            setTimeout(() => {
              handleClose();
            }, 2000);
          } else {
            setPaymentStatus('failed');
            toast.error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentStatus('failed');
          toast.error('Payment verification failed');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: 'User',
        email: 'user@example.com',
        contact: '9999999999'
      },
      notes: {
        category: formData.category,
        merchant: formData.merchant
      },
      theme: {
        color: '#3b82f6'
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      setPaymentStatus('failed');
      toast.error('Payment failed');
    });
    rzp.open();
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setFormData({
      amount: '',
      description: '',
      category: '',
      merchant: '',
      paymentMethod: '',
      metadata: {
        upiId: '',
        bankName: '',
        cardLast4: '',
        cardType: '',
        walletName: ''
      }
    });
    setRazorpayData(null);
    setPaymentStatus('idle');
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(pm => pm.value === formData.paymentMethod);
  };

  const renderPaymentMethodFields = () => {
    const selectedMethod = getSelectedPaymentMethod();
    if (!selectedMethod) return null;

    switch (formData.paymentMethod) {
      case 'upi':
        return (
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="Enter UPI ID (e.g., user@paytm)"
              value={formData.metadata.upiId}
              onChange={(e) => handleInputChange('metadata.upiId', e.target.value)}
            />
          </div>
        );
      case 'card':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardLast4">Last 4 digits</Label>
              <Input
                id="cardLast4"
                placeholder="1234"
                maxLength={4}
                value={formData.metadata.cardLast4}
                onChange={(e) => handleInputChange('metadata.cardLast4', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <Select
                value={formData.metadata.cardType}
                onValueChange={(value) => handleInputChange('metadata.cardType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="debit">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'netbanking':
        return (
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="Enter bank name"
              value={formData.metadata.bankName}
              onChange={(e) => handleInputChange('metadata.bankName', e.target.value)}
            />
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-2">
            <Label htmlFor="walletName">Wallet Name</Label>
            <Input
              id="walletName"
              placeholder="e.g., Paytm, PhonePe, Google Pay"
              value={formData.metadata.walletName}
              onChange={(e) => handleInputChange('metadata.walletName', e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant *</Label>
                <Input
                  id="merchant"
                  placeholder="e.g., Amazon, Swiggy, Uber"
                  value={formData.merchant}
                  onChange={(e) => handleInputChange('merchant', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe this transaction..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <method.icon className="w-4 h-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method Specific Fields */}
            {formData.paymentMethod && renderPaymentMethodFields()}

            {/* Payment Method Info */}
            {formData.paymentMethod && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const selectedMethod = getSelectedPaymentMethod();
                      const Icon = selectedMethod?.icon || CreditCard;
                      return <Icon className="w-6 h-6 text-blue-600" />;
                    })()}
                    <div>
                      <div className="font-medium">
                        {getSelectedPaymentMethod()?.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getSelectedPaymentMethod()?.description}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrder} 
                disabled={loading || !formData.amount || !formData.description || !formData.category || !formData.merchant || !formData.paymentMethod}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              {paymentStatus === 'processing' && (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Processing Payment</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please complete the payment in the Razorpay window
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-green-600">Payment Successful!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your transaction has been recorded successfully
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="space-y-4">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-red-600">Payment Failed</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      There was an error processing your payment
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Payment Window</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      The Razorpay payment window should open shortly. If it doesn't, please check your popup blocker.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;


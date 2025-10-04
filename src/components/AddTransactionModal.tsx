import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Banknote,
  Loader2,
  CheckCircle
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
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    merchant: '',
    paymentMethod: '',
    notes: ''
  });

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
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'netbanking', label: 'Net Banking', icon: Building2 },
    { value: 'wallet', label: 'Digital Wallet', icon: Wallet },
    { value: 'other', label: 'Other', icon: Plus }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.createTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        merchant: formData.merchant,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      if (response.success) {
        toast.success('Transaction recorded successfully!');
        onTransactionAdded();
        handleClose();
      } else {
        toast.error(response.message || 'Failed to record transaction');
      }
    } catch (error) {
      console.error('Create transaction error:', error);
      toast.error('Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      amount: '',
      description: '',
      category: '',
      merchant: '',
      paymentMethod: '',
      notes: ''
    });
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
              <Label htmlFor="merchant">Merchant</Label>
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
              <Label htmlFor="paymentMethod">Payment Method</Label>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.amount || !formData.description || !formData.category}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Transaction'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;


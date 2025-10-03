import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Coins as CoinsIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: any;
  onAddExpense: (categoryId: string, amount: number, description: string) => void;
}

export default function AddExpenseModal({ 
  open, 
  onClose, 
  categoryId, 
  categoryName,
  categoryColor,
  categoryIcon: Icon,
  onAddExpense 
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const expenseAmount = parseFloat(amount);
    
    if (!amount || expenseAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    onAddExpense(categoryId, expenseAmount, description);
    
    // Reset form
    setAmount('');
    setDescription('');
    onClose();
  };

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`
              }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            Add Expense
          </DialogTitle>
          <DialogDescription>
            Adding to {categoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 text-2xl h-14"
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-sm"
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Coffee, Groceries, Bus fare"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Info Card */}
          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CoinsIcon className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Tracking this expense will help you manage your weekly goals and earn coins!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
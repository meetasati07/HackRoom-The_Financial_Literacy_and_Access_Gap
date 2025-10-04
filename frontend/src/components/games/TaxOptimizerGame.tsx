import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, FileText, Coins, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';

interface TaxOptimizerGameProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

interface TaxSavingOption {
  id: string;
  name: string;
  section: string;
  maxAmount: number;
  description: string;
  selected: boolean;
}

const taxOptions: TaxSavingOption[] = [
  {
    id: '1',
    name: 'PPF (Public Provident Fund)',
    section: '80C',
    maxAmount: 150000,
    description: 'Long-term savings with tax-free returns',
    selected: false,
  },
  {
    id: '2',
    name: 'ELSS Mutual Funds',
    section: '80C',
    maxAmount: 150000,
    description: 'Equity-linked savings with 3-year lock-in',
    selected: false,
  },
  {
    id: '3',
    name: 'Life Insurance Premium',
    section: '80C',
    maxAmount: 150000,
    description: 'Term insurance premiums',
    selected: false,
  },
  {
    id: '4',
    name: 'Health Insurance',
    section: '80D',
    maxAmount: 25000,
    description: 'Medical insurance for self and family',
    selected: false,
  },
  {
    id: '5',
    name: 'NPS (National Pension System)',
    section: '80CCD(1B)',
    maxAmount: 50000,
    description: 'Additional deduction for pension savings',
    selected: false,
  },
  {
    id: '6',
    name: 'Home Loan Interest',
    section: '24(b)',
    maxAmount: 200000,
    description: 'Interest paid on home loan',
    selected: false,
  },
];

export default function TaxOptimizerGame({ onClose, onComplete }: TaxOptimizerGameProps) {
  const [options, setOptions] = useState<TaxSavingOption[]>(taxOptions);
  const [annualIncome] = useState(1200000); // 12 LPA
  const [showResult, setShowResult] = useState(false);

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleToggle = (id: string) => {
    setOptions(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, selected: !opt.selected } : opt))
    );
  };

  const calculateTax = (income: number, deductions: number) => {
    const taxableIncome = Math.max(0, income - deductions);
    let tax = 0;

    // New Tax Regime Slabs (simplified)
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.3;
      tax += (1500000 - 1200000) * 0.2;
      tax += (1200000 - 900000) * 0.15;
      tax += (900000 - 600000) * 0.1;
      tax += (600000 - 300000) * 0.05;
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.2;
      tax += (1200000 - 900000) * 0.15;
      tax += (900000 - 600000) * 0.1;
      tax += (600000 - 300000) * 0.05;
    } else if (taxableIncome > 900000) {
      tax += (taxableIncome - 900000) * 0.15;
      tax += (900000 - 600000) * 0.1;
      tax += (600000 - 300000) * 0.05;
    } else if (taxableIncome > 600000) {
      tax += (taxableIncome - 600000) * 0.1;
      tax += (600000 - 300000) * 0.05;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    return Math.round(tax);
  };

  const handleCalculate = () => {
    setShowResult(true);

    const selectedOptions = options.filter(opt => opt.selected);
    const totalDeductions = selectedOptions.reduce((sum, opt) => sum + opt.maxAmount, 0);

    const taxWithoutPlanning = calculateTax(annualIncome, 0);
    const taxWithPlanning = calculateTax(annualIncome, totalDeductions);
    const savings = taxWithoutPlanning - taxWithPlanning;

    // Award coins based on tax savings
    let coinsEarned = 200;
    if (savings > 100000) coinsEarned = 350;
    else if (savings > 50000) coinsEarned = 300;
    else if (savings > 25000) coinsEarned = 250;

    setTimeout(() => {
      toast.success(`Tax optimized! +${coinsEarned} coins 🎉`);
      setTimeout(() => {
        onComplete(coinsEarned);
      }, 1500);
    }, 1000);
  };

  const selectedOptions = options.filter(opt => opt.selected);
  const totalDeductions = selectedOptions.reduce((sum, opt) => sum + opt.maxAmount, 0);
  const taxWithoutPlanning = calculateTax(annualIncome, 0);
  const taxWithPlanning = calculateTax(annualIncome, totalDeductions);
  const taxSavings = taxWithoutPlanning - taxWithPlanning;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full w-full flex items-center justify-center py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg md:max-w-2xl lg:max-w-3xl bg-background rounded-xl md:rounded-2xl shadow-2xl overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 md:p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl mb-1">Tax Optimizer Challenge</h2>
                <p className="text-sm text-indigo-100">Annual Income: ₹{(annualIncome / 100000).toFixed(1)} LPA</p>
              </div>
              <FileText className="w-8 h-8" />
            </div>
          </div>

          <div className="p-4 md:p-5">
            {!showResult ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Select the tax-saving investments you want to make to reduce your tax liability:
                </p>

                <div className="space-y-3 mb-6">
                  {options.map((option) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          option.selected
                            ? 'border-2 border-primary bg-primary/5'
                            : 'border-2 border-transparent hover:border-border'
                        }`}
                        onClick={() => handleToggle(option.id)}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={option.selected}
                            onCheckedChange={() => handleToggle(option.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold">{option.name}</h4>
                              <span className="text-sm font-bold text-green-600">
                                ₹{(option.maxAmount / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {option.description}
                            </p>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Section {option.section}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Live Calculation */}
                <Card className="p-6 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 border-2 mb-6">
                  <h3 className="font-semibold mb-4 text-center">Your Tax Savings</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Total Deductions</div>
                      <div className="text-xl font-bold text-blue-600">
                        ₹{totalDeductions.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Tax Payable</div>
                      <div className="text-xl font-bold text-orange-600">
                        ₹{taxWithPlanning.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Tax Saved</div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{taxSavings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={handleCalculate}
                  disabled={selectedOptions.length === 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 h-12"
                >
                  {selectedOptions.length === 0 ? 'Select at least one option' : 'Optimize My Taxes'}
                </Button>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>💡 Tip:</strong> Combining multiple tax-saving instruments can significantly reduce your tax liability while building wealth!
                  </p>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-6">
                  {taxSavings > 100000 ? 'Excellent Tax Planning! 🎉' :
                   taxSavings > 50000 ? 'Great Optimization! 👍' :
                   'Good Start! 📊'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <Card className="p-6 bg-red-50 dark:bg-red-950/20">
                    <div className="text-sm text-muted-foreground mb-2">Without Planning</div>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{taxWithoutPlanning.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Tax Payable</div>
                  </Card>

                  <Card className="p-6 bg-orange-50 dark:bg-orange-950/20">
                    <div className="text-sm text-muted-foreground mb-2">With Planning</div>
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{taxWithPlanning.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Tax Payable</div>
                  </Card>
                </div>

                <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Total Tax Savings</div>
                  <div className="text-4xl font-bold text-green-600">
                    ₹{taxSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    That's {((taxSavings / taxWithoutPlanning) * 100).toFixed(1)}% reduction in tax!
                  </div>
                </Card>

                <div className="text-left space-y-3 bg-muted p-4 rounded-lg">
                  <p className="font-semibold">📋 Selected Investments:</p>
                  <ul className="space-y-2 text-sm">
                    {selectedOptions.map(opt => (
                      <li key={opt.id} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{opt.name} - ₹{opt.maxAmount.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
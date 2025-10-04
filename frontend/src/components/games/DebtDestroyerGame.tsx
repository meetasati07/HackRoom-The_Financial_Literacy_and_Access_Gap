import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, TrendingDown, Coins, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import { debtDestroyerScenarios, getRandomScenario, getUsedQuestions, saveUsedQuestions } from '../../utils/questionPools';

interface DebtDestroyerGameProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

interface Debt {
  id: number;
  name: string;
  amount: number;
  interest: number;
  minPayment: number;
}

export default function DebtDestroyerGame({ onClose, onComplete }: DebtDestroyerGameProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [extraPayment, setExtraPayment] = useState(0);
  const [scenarioId, setScenarioId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load random scenario on mount
  useEffect(() => {
    const usedIds = getUsedQuestions('debtDestroyer');
    const scenario = getRandomScenario(debtDestroyerScenarios, usedIds);
    
    setDebts(scenario.debts);
    setExtraPayment(scenario.extraPayment);
    setScenarioId(scenario.id);
    setIsLoading(false);
  }, []);
  const [method, setMethod] = useState<'snowball' | 'avalanche' | null>(null);
  const [gamePhase, setGamePhase] = useState<'choose' | 'result'>('choose');
  const [monthsPassed, setMonthsPassed] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);

  const calculatePayoffStrategy = (strategy: 'snowball' | 'avalanche') => {
    let workingDebts = [...debts];
    let months = 0;
    let totalInterest = 0;
    const maxMonths = 120; // Safety limit

    while (workingDebts.length > 0 && months < maxMonths) {
      months++;
      
      // Sort debts based on strategy
      if (strategy === 'snowball') {
        workingDebts.sort((a, b) => a.amount - b.amount);
      } else {
        workingDebts.sort((a, b) => b.interest - a.interest);
      }

      // Apply interest to all debts
      workingDebts = workingDebts.map(debt => ({
        ...debt,
        amount: debt.amount + (debt.amount * debt.interest / 100 / 12),
      }));

      // Calculate monthly interest
      const monthlyInterest = workingDebts.reduce(
        (sum, debt) => sum + (debt.amount * debt.interest / 100 / 12),
        0
      );
      totalInterest += monthlyInterest;

      // Pay minimum on all debts
      let remainingPayment = extraPayment;
      workingDebts = workingDebts.map(debt => ({
        ...debt,
        amount: Math.max(0, debt.amount - debt.minPayment),
      }));

      // Apply extra payment to priority debt
      if (workingDebts[0] && remainingPayment > 0) {
        const paymentToFirst = Math.min(remainingPayment, workingDebts[0].amount);
        workingDebts[0].amount -= paymentToFirst;
      }

      // Remove paid-off debts
      workingDebts = workingDebts.filter(debt => debt.amount > 0);
    }

    return { months, totalInterest };
  };

  const handleMethodSelect = (selectedMethod: 'snowball' | 'avalanche') => {
    setMethod(selectedMethod);
    const result = calculatePayoffStrategy(selectedMethod);
    setMonthsPassed(result.months);
    setTotalInterestPaid(result.totalInterest);
    setGamePhase('result');

    // Award coins based on efficiency
    const coinsEarned = selectedMethod === 'avalanche' ? 200 : 150; // Avalanche is more efficient
    
    // Save used scenario
    saveUsedQuestions('debtDestroyer', [scenarioId]);
    
    setTimeout(() => {
      toast.success(`Strategy applied! +${coinsEarned} coins 🎉`);
      setTimeout(() => {
        onComplete(coinsEarned);
      }, 1500);
    }, 1000);
  };

  if (isLoading || debts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 animate-spin text-red-600" />
            <span>Loading scenario...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full w-full flex items-center justify-center py-3 md:py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md md:max-w-lg lg:max-w-xl bg-background rounded-xl md:rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-3 md:p-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Debt Destroyer Challenge</h2>
              <TrendingDown className="w-8 h-8" />
            </div>
            <p className="text-sm text-red-100 mt-2">
              Choose the best strategy to eliminate your debts!
            </p>
          </div>

          <div className="p-3 md:p-4 max-h-[calc(90vh-150px)] overflow-y-auto">
            {gamePhase === 'choose' && (
              <>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Your Debts</h3>
                  <div className="space-y-3">
                    {debts.map((debt) => (
                      <Card key={debt.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{debt.name}</h4>
                          <span className="text-lg font-bold text-red-600">
                            ₹{debt.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Interest: {debt.interest}%</span>
                          <span>Min. Payment: ₹{debt.minPayment}</span>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Debt:</span>
                      <span className="text-xl font-bold">₹{totalDebt.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold">Extra Monthly Payment:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{extraPayment.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Choose Your Strategy</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMethodSelect('snowball')}
                      className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent text-left transition-all"
                    >
                      <h4 className="font-semibold text-lg mb-2">Snowball Method</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pay off smallest debts first for quick wins and motivation.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <Coins className="w-4 h-4" />
                        <span>150 Coins</span>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMethodSelect('avalanche')}
                      className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent text-left transition-all"
                    >
                      <h4 className="font-semibold text-lg mb-2">Avalanche Method</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pay off highest interest debts first to save money on interest.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Coins className="w-4 h-4" />
                        <span>200 Coins (Most Efficient!)</span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {gamePhase === 'result' && method && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingDown className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {method === 'avalanche' ? 'Excellent Choice!' : 'Good Strategy!'}
                </h3>

                <div className="space-y-4 mb-8">
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <div className="text-sm text-muted-foreground mb-1">Debt-Free In</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.ceil(monthsPassed / 12)} years {monthsPassed % 12} months
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-1">Total Interest Paid</div>
                    <div className="text-3xl font-bold text-red-600">
                      ₹{Math.round(totalInterestPaid).toLocaleString()}
                    </div>
                  </Card>

                  {method === 'avalanche' && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      🎉 You chose the most cost-effective method!
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro Tip:</strong> The {method === 'avalanche' ? 'Avalanche' : 'Snowball'} 
                    {' '}method {method === 'avalanche' 
                      ? 'saves you the most money by tackling high-interest debt first.' 
                      : 'gives you quick wins to stay motivated on your debt-free journey.'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

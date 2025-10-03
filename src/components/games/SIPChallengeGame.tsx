import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Target, Coins, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { toast } from 'sonner@2.0.3';

interface SIPChallengeGameProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

export default function SIPChallengeGame({ onClose, onComplete }: SIPChallengeGameProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [showResult, setShowResult] = useState(false);

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = years * 12;
    
    // Future Value of SIP = P × [{(1 + r)^n - 1} / r] × (1 + r)
    const futureValue = monthlyInvestment * 
      (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    
    const totalInvested = monthlyInvestment * months;
    const returns = futureValue - totalInvested;
    
    return {
      futureValue: Math.round(futureValue),
      totalInvested,
      returns: Math.round(returns),
    };
  };

  const handleCalculate = () => {
    setShowResult(true);
    const result = calculateSIP();
    
    // Award coins based on investment strategy
    let coinsEarned = 150;
    if (years >= 15) coinsEarned = 250;
    else if (years >= 10) coinsEarned = 200;
    
    setTimeout(() => {
      toast.success(`SIP planned! +${coinsEarned} coins 🎉`);
      setTimeout(() => {
        onComplete(coinsEarned);
      }, 1500);
    }, 1000);
  };

  const result = calculateSIP();

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

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 md:p-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">SIP Challenge</h2>
              <Target className="w-8 h-8" />
            </div>
            <p className="text-sm text-purple-100 mt-2">
              Plan your systematic investment and see the power of compounding!
            </p>
          </div>

          <div className="p-3 md:p-4 max-h-[calc(90vh-140px)] overflow-y-auto">
            {!showResult ? (
              <>
                <div className="space-y-8 mb-8">
                  {/* Monthly Investment */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="font-semibold">Monthly Investment</label>
                      <span className="text-2xl font-bold text-purple-600">
                        ₹{monthlyInvestment.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      value={[monthlyInvestment]}
                      onValueChange={(value) => setMonthlyInvestment(value[0])}
                      min={500}
                      max={50000}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>₹500</span>
                      <span>₹50,000</span>
                    </div>
                  </div>

                  {/* Investment Period */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="font-semibold">Investment Period</label>
                      <span className="text-2xl font-bold text-blue-600">
                        {years} years
                      </span>
                    </div>
                    <Slider
                      value={[years]}
                      onValueChange={(value) => setYears(value[0])}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  {/* Expected Return */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="font-semibold">Expected Annual Return</label>
                      <span className="text-2xl font-bold text-green-600">
                        {expectedReturn}%
                      </span>
                    </div>
                    <Slider
                      value={[expectedReturn]}
                      onValueChange={(value) => setExpectedReturn(value[0])}
                      min={6}
                      max={15}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>6%</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <Card className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20 border-2 mb-6">
                  <h3 className="font-semibold mb-4 text-center">Projected Returns</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Invested</div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{result.totalInvested.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Returns</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{result.returns.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                      <div className="text-lg font-bold text-purple-600">
                        ₹{result.futureValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={handleCalculate}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
                >
                  Start SIP Journey
                </Button>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>💡 Pro Tip:</strong> Starting early and staying invested for the long term maximizes the power of compounding. Even small monthly investments can grow significantly over time!
                  </p>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <TrendingUp className="w-12 h-12 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-6">
                  Your SIP Journey Begins! 🚀
                </h3>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-sm text-muted-foreground mb-2">Monthly Investment</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{monthlyInvestment.toLocaleString()}
                    </div>
                  </Card>

                  <Card className="p-6 bg-green-50 dark:bg-green-950/20">
                    <div className="text-sm text-muted-foreground mb-2">Total Invested</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{result.totalInvested.toLocaleString()}
                    </div>
                  </Card>

                  <Card className="p-6 bg-purple-50 dark:bg-purple-950/20">
                    <div className="text-sm text-muted-foreground mb-2">Final Value</div>
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{result.futureValue.toLocaleString()}
                    </div>
                  </Card>
                </div>

                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <span className="font-semibold">Wealth Created</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{result.returns.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    That's {((result.returns / result.totalInvested) * 100).toFixed(1)}% returns on your investment!
                  </div>
                </Card>

                <div className="space-y-3 text-sm text-left bg-muted p-4 rounded-lg">
                  <p><strong>🎯 Key Takeaways:</strong></p>
                  <ul className="space-y-2 ml-4">
                    <li>• Systematic investing reduces market timing risk</li>
                    <li>• Compounding works best over longer periods</li>
                    <li>• Consistency is more important than amount</li>
                    <li>• Start early, even with small amounts</li>
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
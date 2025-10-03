import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Coins, DollarSign, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { stockMarketScenarios, getRandomScenario, getUsedQuestions, saveUsedQuestions } from '../../utils/questionPools';

interface StockMarketGameProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

interface Stock {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: number;
  owned: number;
}

export default function StockMarketGame({ onClose, onComplete }: StockMarketGameProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cash, setCash] = useState(0);
  const [scenarioId, setScenarioId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [initialCash, setInitialCash] = useState(0);
  const maxRounds = 5;

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load random scenario on mount
  useEffect(() => {
    const usedIds = getUsedQuestions('stockMarket');
    const scenario = getRandomScenario(stockMarketScenarios, usedIds);
    
    setStocks(scenario.stocks);
    setCash(scenario.startingCash);
    setInitialCash(scenario.startingCash);
    setScenarioId(scenario.id);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (round > maxRounds) {
      handleGameEnd();
    }
  }, [round]);

  const updateStockPrices = () => {
    setStocks(prevStocks =>
      prevStocks.map(stock => {
        const changePercent = (Math.random() - 0.5) * 20; // -10% to +10%
        const priceChange = stock.price * (changePercent / 100);
        return {
          ...stock,
          price: Math.max(100, Math.round(stock.price + priceChange)),
          change: changePercent,
        };
      })
    );
  };

  const handleBuy = (stockId: number) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;

    if (cash >= stock.price) {
      setCash(prev => prev - stock.price);
      setStocks(prevStocks =>
        prevStocks.map(s =>
          s.id === stockId ? { ...s, owned: s.owned + 1 } : s
        )
      );
      toast.success(`Bought 1 share of ${stock.symbol} for ₹${stock.price}`);
    } else {
      toast.error('Not enough cash!');
    }
  };

  const handleSell = (stockId: number) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock || stock.owned === 0) {
      toast.error('No shares to sell!');
      return;
    }

    setCash(prev => prev + stock.price);
    setStocks(prevStocks =>
      prevStocks.map(s =>
        s.id === stockId ? { ...s, owned: s.owned - 1 } : s
      )
    );
    toast.success(`Sold 1 share of ${stock.symbol} for ₹${stock.price}`);
  };

  const handleNextRound = () => {
    if (round < maxRounds) {
      updateStockPrices();
      setRound(prev => prev + 1);
    }
  };

  const calculatePortfolioValue = () => {
    const stockValue = stocks.reduce((sum, stock) => sum + stock.price * stock.owned, 0);
    return cash + stockValue;
  };

  const handleGameEnd = () => {
    setGameOver(true);
    const finalValue = calculatePortfolioValue();
    const profit = finalValue - initialCash;
    const profitPercent = (profit / initialCash) * 100;

    let coinsEarned = 200;
    if (profitPercent > 20) {
      coinsEarned = 300;
    } else if (profitPercent > 10) {
      coinsEarned = 250;
    } else if (profitPercent > 0) {
      coinsEarned = 200;
    } else {
      coinsEarned = 100; // Participation reward
    }

    // Save used scenario
    saveUsedQuestions('stockMarket', [scenarioId]);

    setTimeout(() => {
      toast.success(`Game completed! +${coinsEarned} coins 🎉`);
      setTimeout(() => {
        onComplete(coinsEarned);
      }, 1500);
    }, 1000);
  };

  if (isLoading || stocks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading market...</span>
          </div>
        </Card>
      </div>
    );
  }

  const portfolioValue = calculatePortfolioValue();
  const profit = portfolioValue - initialCash;
  const profitPercent = (profit / initialCash) * 100;

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

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl">Stock Market Simulator</h2>
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Round {round}/{maxRounds}</span>
              <span>Portfolio: ₹{portfolioValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {!gameOver ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                    <div className="text-sm text-muted-foreground mb-1">Cash Available</div>
                    <div className="text-xl font-bold text-green-600">
                      ₹{cash.toLocaleString()}
                    </div>
                  </Card>
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
                    <div className="text-xl font-bold text-blue-600">
                      ₹{portfolioValue.toLocaleString()}
                    </div>
                  </Card>
                  <Card className={`p-4 ${profit >= 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                    <div className="text-sm text-muted-foreground mb-1">Profit/Loss</div>
                    <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()} ({profitPercent.toFixed(1)}%)
                    </div>
                  </Card>
                </div>

                {/* Stocks */}
                <div className="space-y-3 mb-6">
                  {stocks.map((stock) => (
                    <motion.div
                      key={stock.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <h4 className="font-bold">{stock.symbol}</h4>
                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                              </div>
                              {round > 1 && (
                                <div className={`flex items-center gap-1 text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                  <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-semibold">₹{stock.price}</span>
                              <span className="text-muted-foreground">Owned: {stock.owned}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBuy(stock.id)}
                              disabled={cash < stock.price}
                              className="bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30"
                            >
                              Buy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSell(stock.id)}
                              disabled={stock.owned === 0}
                              className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                            >
                              Sell
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={handleNextRound}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {round < maxRounds ? 'Next Round →' : 'Finish Game'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  <strong>Tip:</strong> Buy low, sell high! Watch the market trends carefully.
                </p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  profit >= 0 ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {profit >= 0 ? (
                    <TrendingUp className="w-12 h-12 text-white" />
                  ) : (
                    <DollarSign className="w-12 h-12 text-white" />
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {profitPercent > 20 ? 'Outstanding Performance! 🎉' :
                   profitPercent > 10 ? 'Great Job! 📈' :
                   profitPercent > 0 ? 'Well Done! 👍' :
                   'Learning Experience! 📚'}
                </h3>

                <div className="space-y-3 max-w-md mx-auto mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Final Portfolio Value</div>
                    <div className="text-2xl font-bold">₹{portfolioValue.toLocaleString()}</div>
                  </div>
                  <div className={`p-4 rounded-lg ${profit >= 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                    <div className="text-sm text-muted-foreground">Total Profit/Loss</div>
                    <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()} ({profitPercent.toFixed(1)}%)
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {profit >= 0 
                    ? "You've learned the basics of stock trading! Keep diversifying your portfolio."
                    : "Remember: The stock market has ups and downs. Learn from every trade!"}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
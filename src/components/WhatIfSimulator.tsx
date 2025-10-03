import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Coffee, Film, Music, ShoppingBag, UtensilsCrossed, 
  Bike, PartyPopper, Smartphone, Sparkles, Calculator, ArrowRight,
  PiggyBank, TrendingDown, Leaf, Award, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: any;
  defaultAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  category: string;
  color: string;
  emoji: string;
}

const scenarios: Scenario[] = [
  {
    id: 'eating-out',
    title: 'Eating Out vs. Cooking at Home',
    description: 'Daily dining expenses vs. home-cooked meals with investment',
    icon: UtensilsCrossed,
    defaultAmount: 200,
    frequency: 'daily',
    category: 'Food',
    color: '#10b981',
    emoji: '🍽️'
  },
  {
    id: 'coffee',
    title: 'Daily Coffee vs. SIP Investment',
    description: 'Your daily caffeine fix vs. systematic investment plan',
    icon: Coffee,
    defaultAmount: 50,
    frequency: 'daily',
    category: 'Beverages',
    color: '#f59e0b',
    emoji: '☕'
  },
  {
    id: 'movies',
    title: 'Weekend Movies vs. Mutual Fund',
    description: 'Entertainment expenses vs. long-term wealth building',
    icon: Film,
    defaultAmount: 600,
    frequency: 'weekly',
    category: 'Entertainment',
    color: '#8b5cf6',
    emoji: '🎬'
  },
  {
    id: 'subscriptions',
    title: 'OTT/Spotify vs. Savings',
    description: 'Monthly subscriptions vs. systematic savings',
    icon: Music,
    defaultAmount: 400,
    frequency: 'monthly',
    category: 'Subscriptions',
    color: '#ec4899',
    emoji: '🎵'
  },
  {
    id: 'shopping',
    title: 'Shopping Splurge vs. Long-Term Growth',
    description: 'Impulse purchases vs. wealth accumulation',
    icon: ShoppingBag,
    defaultAmount: 2000,
    frequency: 'quarterly',
    category: 'Shopping',
    color: '#ef4444',
    emoji: '👕'
  },
  {
    id: 'food-delivery',
    title: 'Food Delivery vs. Fixed Deposit',
    description: 'Convenience dining vs. guaranteed returns',
    icon: UtensilsCrossed,
    defaultAmount: 1000,
    frequency: 'monthly',
    category: 'Food Delivery',
    color: '#06b6d4',
    emoji: '🍔'
  },
  {
    id: 'fuel',
    title: 'Fuel Saving vs. Green Investment',
    description: 'Transportation costs vs. eco-friendly investments',
    icon: Bike,
    defaultAmount: 500,
    frequency: 'monthly',
    category: 'Transportation',
    color: '#059669',
    emoji: '⛽'
  },
  {
    id: 'party',
    title: 'Party/Clubbing vs. Emergency Fund',
    description: 'Social expenses vs. financial security',
    icon: PartyPopper,
    defaultAmount: 1500,
    frequency: 'monthly',
    category: 'Social',
    color: '#f97316',
    emoji: '🎉'
  },
  {
    id: 'mobile',
    title: 'Mobile Upgrade vs. Retirement Corpus',
    description: 'Latest gadgets vs. future financial freedom',
    icon: Smartphone,
    defaultAmount: 20000,
    frequency: 'quarterly',
    category: 'Technology',
    color: '#3b82f6',
    emoji: '📱'
  },
  {
    id: 'festival',
    title: 'Festival Shopping vs. Gold Investment',
    description: 'Festive expenses vs. precious metal investments',
    icon: Sparkles,
    defaultAmount: 5000,
    frequency: 'quarterly',
    category: 'Festivals',
    color: '#eab308',
    emoji: '✨'
  }
];

export default function WhatIfSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('12');
  const [returnRate, setReturnRate] = useState<string>('12');
  const [showResults, setShowResults] = useState(false);

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setAmount(scenario.defaultAmount.toString());
      setShowResults(false);
    }
  };

  const calculateResults = () => {
    if (!selectedScenario || !amount || !duration || !returnRate) return null;

    const amt = parseFloat(amount);
    const dur = parseInt(duration);
    const rate = parseFloat(returnRate) / 100;

    // Calculate total spent
    let totalSpent = 0;
    let monthlyAmount = 0;

    switch (selectedScenario.frequency) {
      case 'daily':
        monthlyAmount = amt * 30;
        break;
      case 'weekly':
        monthlyAmount = amt * 4;
        break;
      case 'monthly':
        monthlyAmount = amt;
        break;
      case 'quarterly':
        monthlyAmount = amt / 3;
        break;
    }

    totalSpent = monthlyAmount * dur;

    // Calculate investment returns (SIP formula)
    const monthlyRate = rate / 12;
    const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, dur) - 1) / monthlyRate) * (1 + monthlyRate);

    const gains = futureValue - totalSpent;
    const percentageGain = ((futureValue - totalSpent) / totalSpent) * 100;

    return {
      totalSpent,
      futureValue,
      gains,
      percentageGain,
      monthlyAmount
    };
  };

  const results = showResults ? calculateResults() : null;

  const getHistogramData = () => {
    if (!results) return [];

    const dur = parseInt(duration);
    const amt = parseFloat(amount);
    const rate = parseFloat(returnRate) / 100;
    const monthlyRate = rate / 12;

    let monthlyAmount = 0;
    switch (selectedScenario!.frequency) {
      case 'daily':
        monthlyAmount = amt * 30;
        break;
      case 'weekly':
        monthlyAmount = amt * 4;
        break;
      case 'monthly':
        monthlyAmount = amt;
        break;
      case 'quarterly':
        monthlyAmount = amt / 3;
        break;
    }

    const data = [];
    let cumulativeSpent = 0;
    let investmentValue = 0;

    for (let month = 1; month <= dur; month++) {
      cumulativeSpent += monthlyAmount;
      
      // SIP formula for accumulated value
      investmentValue = monthlyAmount * ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate) * (1 + monthlyRate);

      data.push({
        month: `M${month}`,
        'If Spent': Math.round(cumulativeSpent),
        'If Invested': Math.round(investmentValue),
      });
    }

    return data;
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'per day';
      case 'weekly': return 'per week';
      case 'monthly': return 'per month';
      case 'quarterly': return 'per quarter';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl mb-2 flex flex-wrap items-center gap-2">
          <Calculator className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            What If Simulator
          </span>
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          Discover how small daily expenses could become big investments
        </p>
      </div>

      {/* Scenario Selection */}
      <Card className="border-2 border-purple-400/30 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <Label className="text-base mb-3 block">Choose Your Scenario</Label>
          <Select onValueChange={handleScenarioSelect}>
            <SelectTrigger className="w-full h-12 text-base bg-background">
              <SelectValue placeholder="Select a what-if scenario..." />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-xl">{scenario.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium">{scenario.title}</div>
                        <div className="text-xs text-muted-foreground">{scenario.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Input Form */}
      {selectedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedScenario.color}20` }}
                >
                  {selectedScenario.emoji}
                </div>
                <div>
                  {selectedScenario.title}
                  <Badge variant="outline" className="ml-2" style={{ color: selectedScenario.color }}>
                    {selectedScenario.category}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>{selectedScenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">
                    Amount ({getFrequencyText(selectedScenario.frequency)})
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Duration Input */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="12"
                  />
                </div>

                {/* Return Rate Input */}
                <div className="space-y-2">
                  <Label htmlFor="return" className="text-sm">Expected Return (% p.a.)</Label>
                  <div className="relative">
                    <Input
                      id="return"
                      type="number"
                      value={returnRate}
                      onChange={(e) => setReturnRate(e.target.value)}
                      placeholder="12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <Button 
                onClick={() => setShowResults(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Impact
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {showResults && results && selectedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Result Message */}
          <Card className="border-2 border-green-400/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-lg sm:text-xl mb-2 flex flex-wrap items-center gap-2">
                    <span>Impact Analysis</span>
                    <Badge className="bg-green-600 text-xs sm:text-sm">
                      +{results.percentageGain.toFixed(1)}% Returns
                    </Badge>
                  </h3>
                  <p className="text-sm sm:text-base mb-3 leading-relaxed">
                    By choosing to invest instead of spending on <strong>{selectedScenario.title.toLowerCase()}</strong>, 
                    you would save <strong>₹{results.totalSpent.toLocaleString()}</strong> in <strong>{duration} months</strong>.
                  </p>
                  <div className="p-3 sm:p-4 bg-white/50 dark:bg-black/20 rounded-lg border-2 border-green-300 dark:border-green-800">
                    <p className="text-base sm:text-lg leading-relaxed">
                      <strong className="text-green-600">If invested at {returnRate}% p.a., that becomes ₹{results.futureValue.toLocaleString()}</strong>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      That's an additional gain of ₹{results.gains.toLocaleString()} just by making smarter choices!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histogram Chart Comparison */}
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Growth Comparison: If Spent vs. If Invested
              </CardTitle>
              <CardDescription>
                Month-by-month histogram showing spending vs. investment growth over {duration} months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={400} minWidth={300}>
                  <ComposedChart data={getHistogramData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      interval={duration > 24 ? 2 : duration > 12 ? 1 : 0}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                      contentStyle={{ 
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    
                    {/* Bars for histogram effect */}
                    <Bar 
                      dataKey="If Spent" 
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                      opacity={0.7}
                    />
                    <Bar 
                      dataKey="If Invested" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                      opacity={0.8}
                    />
                    
                    {/* Lines for trend visualization */}
                    <Line 
                      type="monotone" 
                      dataKey="If Invested" 
                      stroke="#059669" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6">
                <div className="p-3 md:p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                    <div className="text-xs md:text-sm text-muted-foreground">Total Spent</div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-red-600">
                    ₹{results.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ₹{results.monthlyAmount.toLocaleString()}/month
                  </div>
                </div>

                <div className="p-3 md:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                    <div className="text-xs md:text-sm text-muted-foreground">Investment Value</div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    ₹{results.futureValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    @ {returnRate}% p.a. returns
                  </div>
                </div>

                <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                    <div className="text-xs md:text-sm text-muted-foreground">Wealth Gain</div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    ₹{results.gains.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {results.percentageGain.toFixed(1)}% profit
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Recommendations */}
          <Card className="border-2 border-purple-400/30 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    💡 Smart Money Tips
                  </h4>
                  <ul className="text-xs sm:text-sm space-y-2 sm:space-y-2.5 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                      <span className="leading-relaxed">Start small - even ₹50/day compounds to significant wealth over time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                      <span className="leading-relaxed">Set up automatic SIP transfers to make saving effortless</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                      <span className="leading-relaxed">Don't eliminate all pleasures - balance between enjoying today and investing for tomorrow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                      <span className="leading-relaxed">Track where your money goes and identify your own "what-if" scenarios</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Scenarios Grid - Show when no scenario selected */}
      {!selectedScenario && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-semibold mb-4 text-base md:text-lg">Popular Scenarios</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {scenarios.slice(0, 6).map((scenario, index) => {
              const Icon = scenario.icon;
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card 
                    className="border-2 border-border hover:border-purple-400 transition-all cursor-pointer group h-full"
                    onClick={() => handleScenarioSelect(scenario.id)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg md:text-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${scenario.color}20` }}
                        >
                          {scenario.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium mb-1 text-xs md:text-sm line-clamp-2">{scenario.title}</h5>
                          <p className="text-xs text-muted-foreground">
                            ₹{scenario.defaultAmount.toLocaleString()} {getFrequencyText(scenario.frequency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Gamepad2,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Target,
  Briefcase,
  Lock,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import BudgetMasterGame from './games/BudgetMasterGame';
import DebtDestroyerGame from './games/DebtDestroyerGame';
import StockMarketGame from './games/StockMarketGame';
import SIPChallengeGame from './games/SIPChallengeGame';
import TaxOptimizerGame from './games/TaxOptimizerGame';
import { toast } from 'sonner@2.0.3';
import { Language, translations } from '../utils/translations';

interface GamesPageProps {
  user: { name: string; coins: number; level: string } | null;
  onCoinsUpdate?: (newCoins: number) => void;
  language: Language;
}

const games = [
  {
    id: 1,
    title: 'Budget Master',
    description: 'Learn to create and stick to a monthly budget. Balance income, expenses, and savings goals.',
    icon: PiggyBank,
    difficulty: 'Beginner',
    coinsReward: 150,
    color: 'green',
    unlockLevel: 'Beginner',
  },
  {
    id: 2,
    title: 'Debt Destroyer',
    description: 'Master debt repayment strategies. Learn snowball vs avalanche methods to become debt-free.',
    icon: CreditCard,
    difficulty: 'Beginner',
    coinsReward: 200,
    color: 'red',
    unlockLevel: 'Beginner',
  },
  {
    id: 3,
    title: 'Stock Market Simulator',
    description: 'Trade stocks with virtual money. Learn market basics, analyze trends, and build a portfolio.',
    icon: TrendingUp,
    difficulty: 'Intermediate',
    coinsReward: 300,
    color: 'blue',
    unlockLevel: 'Intermediate',
  },
  {
    id: 4,
    title: 'SIP Challenge',
    description: 'Start your first SIP investment. Understand systematic investing and power of compounding.',
    icon: Target,
    difficulty: 'Intermediate',
    coinsReward: 250,
    color: 'purple',
    unlockLevel: 'Intermediate',
  },
  {
    id: 5,
    title: 'Crypto Academy',
    description: 'Learn cryptocurrency basics. Understand blockchain, Bitcoin, and altcoins in a safe environment.',
    icon: Briefcase,
    difficulty: 'Advanced',
    coinsReward: 400,
    color: 'orange',
    unlockLevel: 'Advanced',
  },
  {
    id: 6,
    title: 'Tax Optimizer',
    description: 'Master tax-saving strategies. Learn about 80C, deductions, and smart tax planning.',
    icon: Gamepad2,
    difficulty: 'Advanced',
    coinsReward: 350,
    color: 'indigo',
    unlockLevel: 'Advanced',
  },
];

const quickChallenges = [
  { title: 'Daily Expense Logger', coins: 50, time: '2 min' },
  { title: 'Savings Goal Quiz', coins: 75, time: '3 min' },
  { title: 'Investment Trivia', coins: 100, time: '5 min' },
  { title: 'Budget Review', coins: 125, time: '4 min' },
];

const colorClasses = {
  green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800',
};

const iconColorClasses = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  indigo: 'bg-indigo-500',
};

export default function GamesPage({ user, onCoinsUpdate, language }: GamesPageProps) {
  const userLevel = user?.level || 'Beginner';
  const [activeGame, setActiveGame] = useState<number | null>(null);
  const t = translations[language];

  const isGameUnlocked = (gameLevel: string) => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    return levels.indexOf(userLevel) >= levels.indexOf(gameLevel);
  };

  const handlePlayGame = (gameId: number) => {
    if (!user) {
      toast.error('Please login to play games!');
      return;
    }
    setActiveGame(gameId);
  };

  const handleGameComplete = (coins: number) => {
    toast.success(`Game completed! You earned ${coins} coins! 🎉`);
    setActiveGame(null);
    
    // Update user's coins
    if (user && onCoinsUpdate) {
      const newCoins = user.coins + coins;
      onCoinsUpdate(newCoins);
    }
  };

  const handleGameClose = () => {
    setActiveGame(null);
  };

  return (
    <div className="min-h-screen py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.learningGames}
            </span>
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Learn by playing! Complete games to earn coins and improve your financial knowledge.' :
             language === 'hi' ? 'खेल-खेल में सीखें! सिक्के अर्जित करने और अपने वित्तीय ज्ञान में सुधार करने के लिए खेल पूरे करें।' :
             'खेळत शिका! नाणी मिळवण्यासाठी आणि तुमचे आर्थिक ज्ञान सुधारण्यासाठी गेम पूर्ण करा.'}
          </p>
        </motion.div>

        {/* User Level Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Current Level: {userLevel}</h3>
                      <p className="text-sm text-muted-foreground">
                        {userLevel === 'Beginner' && 'Complete Intermediate games to level up!'}
                        {userLevel === 'Intermediate' && 'You\'re doing great! Try Advanced games.'}
                        {userLevel === 'Advanced' && 'You\'re a financial expert! Master all games.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Games Available</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {games.filter((g) => isGameUnlocked(g.unlockLevel)).length}/{games.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Challenges
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {quickChallenges.map((challenge, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{challenge.time}</Badge>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4" fill="currentColor" />
                      <span className="font-semibold">{challenge.coins}</span>
                    </div>
                  </div>
                  <h4 className="font-medium">{challenge.title}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Main Games */}
        <div>
          <h2 className="text-2xl mb-10">Learning Games</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => {
              const Icon = game.icon;
              const isUnlocked = isGameUnlocked(game.unlockLevel);

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card
                    className={`${
                      isUnlocked
                        ? colorClasses[game.color as keyof typeof colorClasses]
                        : 'bg-muted/50'
                    } border-2 hover:shadow-lg transition-all ${
                      !isUnlocked && 'opacity-60'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-12 h-12 ${
                            isUnlocked ? iconColorClasses[game.color as keyof typeof iconColorClasses] : 'bg-gray-400'
                          } rounded-xl flex items-center justify-center`}
                        >
                          {isUnlocked ? (
                            <Icon className="w-6 h-6 text-white" />
                          ) : (
                            <Lock className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                          {game.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {game.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {game.coinsReward} Coins
                          </span>
                        </div>
                        {!isUnlocked && (
                          <Badge variant="outline" className="text-xs">
                            Unlock at {game.unlockLevel}
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        disabled={!isUnlocked}
                        variant={isUnlocked ? 'default' : 'secondary'}
                        onClick={() => handlePlayGame(game.id)}
                      >
                        {isUnlocked ? t.playGame : t.locked}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Game Modals */}
        {activeGame === 1 && (
          <BudgetMasterGame
            onClose={handleGameClose}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 2 && (
          <DebtDestroyerGame
            onClose={handleGameClose}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 3 && (
          <StockMarketGame
            onClose={handleGameClose}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 4 && (
          <SIPChallengeGame
            onClose={handleGameClose}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 6 && (
          <TaxOptimizerGame
            onClose={handleGameClose}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 5 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-2xl p-8 max-w-md text-center"
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {language === 'en' ? 'Crypto Academy - Coming Soon!' :
                 language === 'hi' ? 'क्रिप्टो अकादमी - जल्द आ रही है!' :
                 'क्रिप्टो अकादमी - लवकरच येत आहे!'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'en' ? 'Learn cryptocurrency basics in a safe environment. This game is under development!' :
                 language === 'hi' ? 'सुरक्षित वातावरण में क्रिप्टोकरेंसी की मूल बातें सीखें। यह गेम विकास में है!' :
                 'सुरक्षित वातावरणात क्रिप्टोकरन्सीचे मूलभूत तत्त्वे शिका. हा गेम विकासाधीन आहे!'}
              </p>
              <Button onClick={handleGameClose}>{t.close}</Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

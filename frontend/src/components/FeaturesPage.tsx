import { motion } from 'motion/react';
import {
  Gamepad2,
  TrendingUp,
  Target,
  PiggyBank,
  AlertCircle,
  Boxes,
  Calculator,
  View,
  Gift,
  LineChart,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface FeaturesPageProps {
  language: Language;
}

const features = [
  {
    icon: Gamepad2,
    title: 'Gamified Learning with Demo Coins',
    description: 'Practice trading and investing with virtual demo coins. Learn without risking real money while building confidence.',
    color: 'blue',
  },
  {
    icon: LineChart,
    title: 'Expense Tracking Dashboard',
    description: 'Visual dashboards with interactive graphs and charts. See your spending patterns at a glance with bar, line, and pie charts.',
    color: 'purple',
  },
  {
    icon: AlertCircle,
    title: 'Debt Tracker & Priority Suggestions',
    description: 'Track all your debts in one place. Get smart suggestions on which debt to pay off first to save on interest.',
    color: 'red',
  },
  {
    icon: Target,
    title: 'Emergency Fund Goal Tracker',
    description: 'Build your safety net with goal tracking. Visualize progress towards 3-6 months of expenses for peace of mind.',
    color: 'green',
  },
  {
    icon: Boxes,
    title: 'Multiple Savings Buckets',
    description: 'Create separate savings goals for vacation, gadgets, education, or any dream. Track each goal independently.',
    color: 'orange',
  },
  {
    icon: Calculator,
    title: '"What-If" Investment Simulator',
    description: 'Scenario-based simulations to see how different investment strategies perform. Learn from mistakes in a safe environment.',
    color: 'indigo',
  },
  {
    icon: View,
    title: 'AR Savings Visualizer',
    description: 'See your future wealth in augmented reality. Visualize what your savings can become with compound interest.',
    color: 'pink',
  },
  {
    icon: Gift,
    title: 'Rewards & Achievement Tokens',
    description: 'Earn points, tokens, and badges for completing financial goals. Redeem rewards and celebrate your progress!',
    color: 'yellow',
  },
  {
    icon: TrendingUp,
    title: 'Investment Progress Tracking',
    description: 'Monitor your SIP investments, mutual funds, and portfolio performance with real-time updates and insights.',
    color: 'cyan',
  },
  {
    icon: PiggyBank,
    title: 'Smart Savings Recommendations',
    description: 'AI-powered suggestions to help you save more. Get personalized tips based on your spending patterns.',
    color: 'teal',
  },
  {
    icon: BarChart3,
    title: 'Income vs Expense Analysis',
    description: 'Detailed breakdown of where your money comes from and where it goes. Identify areas to optimize.',
    color: 'violet',
  },
  {
    icon: PieChart,
    title: 'Category-wise Spending',
    description: 'See spending distribution across food, transport, entertainment, and more. Make informed decisions.',
    color: 'rose',
  },
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/20',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-teal-200 dark:border-teal-800',
    icon: 'bg-teal-500',
    text: 'text-teal-600 dark:text-teal-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-200 dark:border-rose-800',
    icon: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
};

export default function FeaturesPage({ language }: FeaturesPageProps) {
  const t = translations[language];
  
  return (
    <div className="min-h-screen py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl mb-4">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Success
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to track, learn, save, and invest smarter - all in one beautiful platform
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl border ${colors.bg} ${colors.border} hover:shadow-lg transition-shadow`}
              >
                <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-border">
            <h2 className="text-2xl mb-3">Ready to explore these features?</h2>
            <p className="text-muted-foreground mb-4">
              Try our interactive dashboard and see how these features work together
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

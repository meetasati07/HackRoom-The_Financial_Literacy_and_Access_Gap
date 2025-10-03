// Question pools for different games

export interface Question {
  id: number;
  question: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
  coinReward: number;
}

// Budget Master Question Pool
export const budgetMasterQuestions: Question[] = [
  {
    id: 1,
    question: "What is compound interest?",
    options: [
      { text: "Interest calculated only on the principal amount", isCorrect: false, explanation: "This is simple interest, not compound interest." },
      { text: "Interest calculated on principal plus previously earned interest", isCorrect: true, explanation: "Compound interest is when you earn interest on both your initial principal and the interest that has already been added to it. This creates exponential growth over time!" },
      { text: "A fixed amount added monthly", isCorrect: false, explanation: "This doesn't describe compound interest." },
      { text: "Government tax on savings", isCorrect: false, explanation: "Interest is not a tax!" },
    ],
    coinReward: 50,
  },
  {
    id: 2,
    question: "What should you prioritize first with your money?",
    options: [
      { text: "Invest in stocks immediately", isCorrect: false, explanation: "Before investing, you need financial security." },
      { text: "Build an emergency fund", isCorrect: true, explanation: "Building an emergency fund (3-6 months of expenses) should be your first priority. It protects you from unexpected expenses and prevents debt." },
      { text: "Buy the latest gadgets", isCorrect: false, explanation: "Lifestyle purchases should come after financial security." },
      { text: "Lend to friends", isCorrect: false, explanation: "Lending money should never be a priority." },
    ],
    coinReward: 50,
  },
  {
    id: 3,
    question: "How many months of expenses should your emergency fund cover?",
    options: [
      { text: "1-2 months", isCorrect: false, explanation: "Too little coverage." },
      { text: "3-6 months", isCorrect: true, explanation: "Perfect! Industry standard for financial security." },
      { text: "12+ months", isCorrect: false, explanation: "Too much sitting idle. You could invest excess funds." },
      { text: "No need", isCorrect: false, explanation: "Everyone needs an emergency fund!" },
    ],
    coinReward: 50,
  },
  {
    id: 4,
    question: "Your monthly income is ₹40,000. What's a good percentage to save?",
    options: [
      { text: "5-10%", isCorrect: false, explanation: "Too low! Try to save more." },
      { text: "20-30%", isCorrect: true, explanation: "Perfect! This is the recommended range for healthy savings." },
      { text: "50-60%", isCorrect: false, explanation: "Too aggressive for most people." },
      { text: "0-5%", isCorrect: false, explanation: "You need to save more!" },
    ],
    coinReward: 50,
  },
  {
    id: 5,
    question: "What is the 50-30-20 budgeting rule?",
    options: [
      { text: "50% wants, 30% needs, 20% savings", isCorrect: false, explanation: "You have needs and wants reversed!" },
      { text: "50% needs, 30% wants, 20% savings", isCorrect: true, explanation: "Correct! This is a popular budgeting framework for balanced finances." },
      { text: "50% savings, 30% needs, 20% wants", isCorrect: false, explanation: "While saving 50% is great, this isn't the standard rule." },
      { text: "Equal split between all three", isCorrect: false, explanation: "The rule has specific percentages." },
    ],
    coinReward: 50,
  },
  {
    id: 6,
    question: "When should you review your budget?",
    options: [
      { text: "Once a year", isCorrect: false, explanation: "Too infrequent to stay on track." },
      { text: "Never, set it and forget it", isCorrect: false, explanation: "Budgets need regular review and adjustment." },
      { text: "Monthly", isCorrect: true, explanation: "Perfect! Monthly reviews help you stay on track and adjust as needed." },
      { text: "Only when you have financial problems", isCorrect: false, explanation: "Prevention is better than cure!" },
    ],
    coinReward: 50,
  },
];

// Debt Destroyer Question Pool (scenarios)
export const debtDestroyerScenarios = [
  {
    id: 1,
    debts: [
      { id: 1, name: 'Credit Card', amount: 50000, interest: 18, minPayment: 2000 },
      { id: 2, name: 'Personal Loan', amount: 100000, interest: 12, minPayment: 5000 },
      { id: 3, name: 'Car Loan', amount: 200000, interest: 9, minPayment: 8000 },
    ],
    extraPayment: 10000,
  },
  {
    id: 2,
    debts: [
      { id: 1, name: 'Credit Card A', amount: 75000, interest: 22, minPayment: 3000 },
      { id: 2, name: 'Credit Card B', amount: 45000, interest: 20, minPayment: 2000 },
      { id: 3, name: 'Personal Loan', amount: 150000, interest: 14, minPayment: 6000 },
    ],
    extraPayment: 12000,
  },
  {
    id: 3,
    debts: [
      { id: 1, name: 'Student Loan', amount: 300000, interest: 8, minPayment: 10000 },
      { id: 2, name: 'Credit Card', amount: 60000, interest: 24, minPayment: 2500 },
      { id: 3, name: 'Medical Loan', amount: 80000, interest: 10, minPayment: 3500 },
    ],
    extraPayment: 15000,
  },
];

// Stock Market Scenarios
export const stockMarketScenarios = [
  {
    id: 1,
    stocks: [
      { id: 1, name: 'Tech Corp', symbol: 'TECH', price: 1500, change: 0, owned: 0 },
      { id: 2, name: 'Finance Ltd', symbol: 'FIN', price: 800, change: 0, owned: 0 },
      { id: 3, name: 'Energy Co', symbol: 'NRG', price: 500, change: 0, owned: 0 },
    ],
    startingCash: 50000,
  },
  {
    id: 2,
    stocks: [
      { id: 1, name: 'Pharma Plus', symbol: 'PHRM', price: 2200, change: 0, owned: 0 },
      { id: 2, name: 'Auto Motors', symbol: 'AUTO', price: 1100, change: 0, owned: 0 },
      { id: 3, name: 'Retail King', symbol: 'RETL', price: 650, change: 0, owned: 0 },
    ],
    startingCash: 60000,
  },
  {
    id: 3,
    stocks: [
      { id: 1, name: 'Bank Plus', symbol: 'BANK', price: 950, change: 0, owned: 0 },
      { id: 2, name: 'IT Services', symbol: 'ITSV', price: 1800, change: 0, owned: 0 },
      { id: 3, name: 'Consumer Goods', symbol: 'CNGD', price: 720, change: 0, owned: 0 },
    ],
    startingCash: 55000,
  },
];

// Utility functions to get random questions
export const getRandomQuestions = (pool: Question[], count: number, usedIds: number[] = []): Question[] => {
  const availableQuestions = pool.filter(q => !usedIds.includes(q.id));
  
  if (availableQuestions.length < count) {
    // If not enough unused questions, reset and use all
    return shuffleArray([...pool]).slice(0, count);
  }
  
  return shuffleArray(availableQuestions).slice(0, count);
};

export const getRandomScenario = <T extends { id: number }>(pool: T[], usedIds: number[] = []): T => {
  const availableScenarios = pool.filter(s => !usedIds.includes(s.id));
  
  if (availableScenarios.length === 0) {
    // If all scenarios used, reset and pick random
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// LocalStorage management for used questions
export const getUsedQuestions = (gameId: string): number[] => {
  const key = `usedQuestions_${gameId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const saveUsedQuestions = (gameId: string, questionIds: number[]): void => {
  const key = `usedQuestions_${gameId}`;
  const existing = getUsedQuestions(gameId);
  const updated = [...new Set([...existing, ...questionIds])];
  localStorage.setItem(key, JSON.stringify(updated));
};

export const resetUsedQuestions = (gameId: string): void => {
  const key = `usedQuestions_${gameId}`;
  localStorage.removeItem(key);
};

export interface QuizQuestion {
  id: number;
  category: 'basic' | 'banking' | 'investment' | 'advanced';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

// Quiz Question Pool - 40 Questions across 4 categories
export const quizQuestionPool: QuizQuestion[] = [
  // Basic Financial Literacy (10 questions)
  {
    id: 1,
    category: 'basic',
    question: "What does a 'budget' help you do?",
    options: ['Track spending', 'Increase income', 'Eliminate taxes', 'Avoid working'],
    correctAnswer: 0,
    explanation: "A budget helps you track your spending and manage your money effectively.",
    points: 8,
  },
  {
    id: 2,
    category: 'basic',
    question: "What is income?",
    options: ['Money you spend', 'Money you borrow', 'Money you earn', 'Money you donate'],
    correctAnswer: 2,
    explanation: "Income is the money you earn from work, investments, or other sources.",
    points: 8,
  },
  {
    id: 3,
    category: 'basic',
    question: "What does the term 'expense' mean?",
    options: ['Money earned', 'Money borrowed', 'Money owed', 'Money spent'],
    correctAnswer: 3,
    explanation: "Expense refers to money spent on goods or services.",
    points: 8,
  },
  {
    id: 4,
    category: 'basic',
    question: "If your expenses are more than your income, you are:",
    options: ['Saving money', 'Investing', 'In debt', 'Wealthy'],
    correctAnswer: 2,
    explanation: "When expenses exceed income, you're spending more than you earn, leading to debt.",
    points: 8,
  },
  {
    id: 5,
    category: 'basic',
    question: "What is an emergency fund used for?",
    options: ['Buying stocks', 'Paying rent', 'Unexpected expenses', 'Going on vacation'],
    correctAnswer: 2,
    explanation: "An emergency fund covers unexpected expenses like medical bills or job loss.",
    points: 8,
  },
  {
    id: 6,
    category: 'basic',
    question: "What does it mean to live 'within your means'?",
    options: ['Spend more than you earn', 'Spend exactly what you earn', 'Spend less than you earn', 'Take loans often'],
    correctAnswer: 2,
    explanation: "Living within your means is spending less than you earn to build savings.",
    points: 8,
  },
  {
    id: 7,
    category: 'basic',
    question: "Why is saving money important?",
    options: ['To pay more taxes', 'To avoid spending', 'To meet future goals or emergencies', 'To reduce income'],
    correctAnswer: 2,
    explanation: "Saving helps you achieve future goals and handle emergencies without debt.",
    points: 8,
  },
  {
    id: 8,
    category: 'basic',
    question: "A goal to 'save ₹10,000 in 6 months' is:",
    options: ['Unrealistic', 'Unmeasurable', 'A SMART goal', 'Unnecessary'],
    correctAnswer: 2,
    explanation: "This is a SMART goal - Specific, Measurable, Achievable, Relevant, and Time-bound.",
    points: 8,
  },
  {
    id: 9,
    category: 'basic',
    question: "Which of the following is a fixed expense?",
    options: ['Grocery', 'Movie ticket', 'Rent', 'Electricity bill'],
    correctAnswer: 2,
    explanation: "Rent is a fixed expense as it remains constant each month.",
    points: 8,
  },
  {
    id: 10,
    category: 'basic',
    question: "What does the term 'financial literacy' mean?",
    options: ['Ability to read books', 'Ability to earn high income', 'Understanding how to manage money', 'Knowing tax laws'],
    correctAnswer: 2,
    explanation: "Financial literacy is the ability to understand and manage personal finances effectively.",
    points: 8,
  },

  // Banking & Credit (10 questions)
  {
    id: 11,
    category: 'banking',
    question: "What is a savings account?",
    options: ['A loan from a bank', 'An account that earns interest on your deposits', 'An account for only businessmen', 'A type of credit card'],
    correctAnswer: 1,
    explanation: "A savings account earns interest on money you deposit and keep with the bank.",
    points: 8,
  },
  {
    id: 12,
    category: 'banking',
    question: "What is interest?",
    options: ['Money earned or paid for borrowing/lending money', 'A bank penalty', 'Bank service charge', 'Amount of money saved'],
    correctAnswer: 0,
    explanation: "Interest is the cost of borrowing money or the reward for lending/saving money.",
    points: 8,
  },
  {
    id: 13,
    category: 'banking',
    question: "What is a credit card?",
    options: ['Prepaid card', 'Card that deducts from savings', 'A loan facility from the bank', 'Free money'],
    correctAnswer: 2,
    explanation: "A credit card is a loan facility allowing you to borrow money up to a limit.",
    points: 8,
  },
  {
    id: 14,
    category: 'banking',
    question: "What is a credit score?",
    options: ['Your salary', 'Number of accounts you hold', 'A rating of your creditworthiness', 'Your spending limit'],
    correctAnswer: 2,
    explanation: "Credit score rates how reliable you are at repaying borrowed money.",
    points: 8,
  },
  {
    id: 15,
    category: 'banking',
    question: "Which of the following affects your credit score?",
    options: ['Income', 'Number of debit cards', 'Timely repayment of loans', 'Age'],
    correctAnswer: 2,
    explanation: "Timely loan repayment is crucial for maintaining a good credit score.",
    points: 8,
  },
  {
    id: 16,
    category: 'banking',
    question: "What does EMI stand for?",
    options: ['Emergency Money Insurance', 'Equated Monthly Installment', 'Easy Money Investment', 'Equal Money Interest'],
    correctAnswer: 1,
    explanation: "EMI is Equated Monthly Installment - fixed monthly loan payments.",
    points: 8,
  },
  {
    id: 17,
    category: 'banking',
    question: "UPI is used for:",
    options: ['Applying for loans', 'Digital payments', 'Opening bank accounts', 'Getting subsidies'],
    correctAnswer: 1,
    explanation: "UPI (Unified Payments Interface) enables instant digital payments.",
    points: 8,
  },
  {
    id: 18,
    category: 'banking',
    question: "What happens if you fail to repay a loan on time?",
    options: ['Your credit score improves', 'You earn more interest', 'You face penalties and credit score drops', 'Nothing happens'],
    correctAnswer: 2,
    explanation: "Late loan payments result in penalties and damage your credit score.",
    points: 8,
  },
  {
    id: 19,
    category: 'banking',
    question: "A debit card is used to:",
    options: ['Spend money you don\'t have', 'Earn rewards', 'Spend money from your bank account', 'Apply for a loan'],
    correctAnswer: 2,
    explanation: "Debit cards let you spend money directly from your bank account.",
    points: 8,
  },
  {
    id: 20,
    category: 'banking',
    question: "What does 'overdraft' mean in banking?",
    options: ['A tax refund', 'Spending more than your account balance', 'Depositing a cheque', 'Applying for a fixed deposit'],
    correctAnswer: 1,
    explanation: "Overdraft is when you spend more money than you have in your account.",
    points: 8,
  },

  // Investments & Wealth Building (10 questions)
  {
    id: 21,
    category: 'investment',
    question: "Which is an example of an investment?",
    options: ['Buying groceries', 'Buying stocks', 'Paying rent', 'Eating out'],
    correctAnswer: 1,
    explanation: "Buying stocks is an investment that can grow in value over time.",
    points: 8,
  },
  {
    id: 22,
    category: 'investment',
    question: "What is the primary benefit of investing?",
    options: ['Reduce taxes', 'Earn interest', 'Grow wealth over time', 'Avoid working'],
    correctAnswer: 2,
    explanation: "The main benefit of investing is to grow your wealth over time.",
    points: 8,
  },
  {
    id: 23,
    category: 'investment',
    question: "What is a mutual fund?",
    options: ['Loan given to a friend', 'Group investment managed by professionals', 'Type of savings account', 'Cryptocurrency'],
    correctAnswer: 1,
    explanation: "Mutual funds pool money from many investors, managed by professionals.",
    points: 8,
  },
  {
    id: 24,
    category: 'investment',
    question: "What is SIP (Systematic Investment Plan)?",
    options: ['Monthly salary', 'A type of tax', 'Investment method for mutual funds', 'Insurance policy'],
    correctAnswer: 2,
    explanation: "SIP is a disciplined way to invest fixed amounts regularly in mutual funds.",
    points: 8,
  },
  {
    id: 25,
    category: 'investment',
    question: "Which asset class usually offers the highest long-term return?",
    options: ['Fixed deposit', 'Savings account', 'Equity stocks', 'Gold'],
    correctAnswer: 2,
    explanation: "Equity stocks historically provide the highest long-term returns, though with higher risk.",
    points: 8,
  },
  {
    id: 26,
    category: 'investment',
    question: "What is diversification?",
    options: ['Investing all money in one place', 'Avoiding investment', 'Spreading investments across different assets', 'Investing only in real estate'],
    correctAnswer: 2,
    explanation: "Diversification spreads risk by investing in different asset classes.",
    points: 8,
  },
  {
    id: 27,
    category: 'investment',
    question: "What is 'inflation'?",
    options: ['Decrease in income', 'Increase in prices over time', 'Rise in savings', 'More taxes'],
    correctAnswer: 1,
    explanation: "Inflation is the general increase in prices, reducing purchasing power over time.",
    points: 8,
  },
  {
    id: 28,
    category: 'investment',
    question: "What should you do before investing?",
    options: ['Follow friends blindly', 'Research your options and assess risk', 'Only check interest rates', 'Take a loan'],
    correctAnswer: 1,
    explanation: "Always research and understand risks before making investment decisions.",
    points: 8,
  },
  {
    id: 29,
    category: 'investment',
    question: "Long-term investments usually:",
    options: ['Offer quick returns', 'Carry no risk', 'Grow slowly but steadily', 'Have fixed returns always'],
    correctAnswer: 2,
    explanation: "Long-term investments typically grow steadily with compounding over time.",
    points: 8,
  },
  {
    id: 30,
    category: 'investment',
    question: "The stock market is:",
    options: ['A place to gamble', 'A platform for buying/selling company shares', 'Government savings scheme', 'Bank loan scheme'],
    correctAnswer: 1,
    explanation: "Stock market is a regulated platform for trading company shares.",
    points: 8,
  },

  // Advanced Financial Concepts (10 questions)
  {
    id: 31,
    category: 'advanced',
    question: "What is compound interest?",
    options: ['Interest on only principal', 'Interest on principal + accumulated interest', 'One-time interest', 'Government fee'],
    correctAnswer: 1,
    explanation: "Compound interest earns interest on both principal and previously earned interest.",
    points: 8,
  },
  {
    id: 32,
    category: 'advanced',
    question: "A high-risk investment generally means:",
    options: ['High guarantee of profit', 'High return potential with possibility of loss', 'Safe and secure', 'No regulation'],
    correctAnswer: 1,
    explanation: "High-risk investments offer higher potential returns but also greater loss potential.",
    points: 8,
  },
  {
    id: 33,
    category: 'advanced',
    question: "Which document is essential for filing income tax in India?",
    options: ['Aadhaar card', 'PAN card', 'Voter ID', 'Driving license'],
    correctAnswer: 1,
    explanation: "PAN card is mandatory for filing income tax returns in India.",
    points: 8,
  },
  {
    id: 34,
    category: 'advanced',
    question: "What is a 'balance sheet'?",
    options: ['Bank passbook', 'Document showing income only', 'Statement showing assets and liabilities', 'List of purchases'],
    correctAnswer: 2,
    explanation: "Balance sheet shows what you own (assets) and what you owe (liabilities).",
    points: 8,
  },
  {
    id: 35,
    category: 'advanced',
    question: "The 50/30/20 rule in budgeting stands for:",
    options: ['50% bills, 30% rent, 20% shopping', '50% needs, 30% wants, 20% savings', '50% debt, 30% food, 20% EMI', 'None of the above'],
    correctAnswer: 1,
    explanation: "The 50/30/20 rule: 50% needs, 30% wants, 20% savings/debt repayment.",
    points: 8,
  },
  {
    id: 36,
    category: 'advanced',
    question: "What does 'net worth' mean?",
    options: ['Monthly salary', 'Total debt', 'Assets minus liabilities', 'Taxable income'],
    correctAnswer: 2,
    explanation: "Net worth is your total assets minus your total liabilities.",
    points: 8,
  },
  {
    id: 37,
    category: 'advanced',
    question: "The term 'liquidity' refers to:",
    options: ['Legal rights of an asset', 'How quickly an asset can be converted to cash', 'Value of gold', 'Type of investment'],
    correctAnswer: 1,
    explanation: "Liquidity measures how quickly and easily an asset can be converted to cash.",
    points: 8,
  },
  {
    id: 38,
    category: 'advanced',
    question: "An 'insurance premium' is:",
    options: ['Loan amount', 'Cost paid regularly for insurance coverage', 'Fine paid for late payment', 'Bonus received from employer'],
    correctAnswer: 1,
    explanation: "Insurance premium is the regular payment for maintaining insurance coverage.",
    points: 8,
  },
  {
    id: 39,
    category: 'advanced',
    question: "What is a PPF (Public Provident Fund)?",
    options: ['Short-term loan', 'Government-backed long-term savings scheme', 'Private insurance', 'Credit product'],
    correctAnswer: 1,
    explanation: "PPF is a government savings scheme with tax benefits and guaranteed returns.",
    points: 8,
  },
  {
    id: 40,
    category: 'advanced',
    question: "What is 'tax deduction'?",
    options: ['Money given as fine', 'Money added to income', 'Reduction in taxable income', 'Government donation'],
    correctAnswer: 2,
    explanation: "Tax deduction reduces your taxable income, lowering the tax you owe.",
    points: 8,
  },
];

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random questions for quiz
export const getRandomQuizQuestions = (count: number = 5): QuizQuestion[] => {
  return shuffleArray(quizQuestionPool).slice(0, count);
};

// Calculate level based on score
export const calculateLevel = (score: number): string => {
  if (score >= 31) return 'Advanced'; // 4-5 correct (31-40 points)
  if (score >= 16) return 'Intermediate'; // 2-3 correct (16-30 points)
  return 'Beginner'; // 0-1 correct (0-15 points)
};

// Calculate coins based on performance
export const calculateCoins = (correctAnswers: number, totalQuestions: number): number => {
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  if (percentage === 100) return 200; // Perfect score
  if (percentage >= 80) return 150; // 4/5 correct
  if (percentage >= 60) return 100; // 3/5 correct
  if (percentage >= 40) return 75; // 2/5 correct
  if (percentage >= 20) return 50; // 1/5 correct
  return 25; // Participation reward
};

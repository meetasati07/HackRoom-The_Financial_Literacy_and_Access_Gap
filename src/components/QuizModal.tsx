import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Trophy, Coins, TrendingUp, Zap, Award, Star, RotateCcw } from 'lucide-react';
import { getRandomQuizQuestions, calculateLevel, calculateCoins, QuizQuestion } from '../utils/quizQuestions';
import { Card } from './ui/card';

interface QuizModalProps {
  userName: string;
  onClose: () => void;
  onComplete: (result: { coins: number; level: string }) => void;
  language: any;
}

export default function QuizModal({ userName, onClose, onComplete, language }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load random questions on mount
  useEffect(() => {
    const randomQuestions = getRandomQuizQuestions(5);
    setQuestions(randomQuestions);
    setIsLoading(false);
  }, []);

  if (isLoading || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 animate-spin text-purple-600" />
            <span>Loading quiz...</span>
          </div>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    if (!showExplanation) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setTotalScore(totalScore + question.points);
    }

    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const getLevel = () => {
    return calculateLevel(totalScore);
  };

  const handleComplete = () => {
    const level = getLevel();
    const coins = calculateCoins(correctAnswers, questions.length);
    onComplete({ coins, level });
  };

  if (showResults) {
    const level = getLevel();
    const score = correctAnswers;
    const coins = calculateCoins(correctAnswers, questions.length);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="min-h-full w-full flex items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl p-8 md:p-12 text-center my-auto"
          >
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: Math.random() * 500, opacity: 1 }}
                  animate={{
                    y: 600,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                  }}
                  className="absolute"
                >
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl mb-4">
              Congratulations, {userName}! 🎉
            </h2>

            <p className="text-xl text-muted-foreground mb-8">
              You've completed the Financial Literacy Assessment
            </p>

            {/* Score Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Your Level</div>
                <div className="text-2xl font-bold text-blue-600">{level}</div>
              </div>

              <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {score}/{questions.length}
                </div>
              </div>

              <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Coins Earned</div>
                <div className="text-2xl font-bold text-yellow-600">{coins}</div>
              </div>
            </div>

            {/* Points Breakdown */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl mb-8">
              <h3 className="font-semibold mb-3">Performance Score</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Points</span>
                <span className="font-bold">{totalScore}/40</span>
              </div>
              <Progress value={(totalScore / 40) * 100} className="h-3" />
            </div>

            {/* Level Description */}
            <div className="text-left mb-8 p-6 bg-muted/50 rounded-xl">
              <h3 className="font-semibold mb-3 text-center">What This Means</h3>
              {level === 'Advanced' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-green-600">Outstanding!</strong> You have a strong grasp of financial concepts.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• You understand advanced financial planning</li>
                    <li>• Ready for complex investment strategies</li>
                    <li>• Continue learning to stay ahead!</li>
                  </ul>
                </div>
              )}
              {level === 'Intermediate' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-blue-600">Great job!</strong> You have solid financial knowledge.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• You understand key financial principles</li>
                    <li>• Keep learning to reach advanced level</li>
                    <li>• Practice with our games to improve!</li>
                  </ul>
                </div>
              )}
              {level === 'Beginner' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-purple-600">Good start!</strong> Everyone begins somewhere.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Focus on building basic financial knowledge</li>
                    <li>• Use our learning games to improve</li>
                    <li>• You'll level up with practice!</li>
                  </ul>
                </div>
              )}
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="min-h-full w-full flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Financial Literacy Assessment</h2>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-semibold">
                  Q{currentQuestion + 1}/{questions.length}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
            <p className="text-sm text-blue-100 mt-2">
              Category: {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
            </p>
          </div>

          {/* Question */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-6">{question.question}</h3>

                <div className="space-y-3 mb-6">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === question.correctAnswer;
                    const showResult = showExplanation && isSelected;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: showExplanation ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showExplanation}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected && !showExplanation
                            ? 'border-primary bg-primary/5'
                            : showResult && isCorrect
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                            : showResult && !isCorrect
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                            : showExplanation && isCorrect
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                            : 'border-border hover:border-primary hover:bg-accent'
                        } ${showExplanation && !isSelected && !isCorrect ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option}</span>
                          {showExplanation && isCorrect && (
                            <span className="text-green-600 font-semibold">✓</span>
                          )}
                          {showResult && !isCorrect && (
                            <span className="text-red-600 font-semibold">✗</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Explanation
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                {!showExplanation ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                  >
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Progress Indicator */}
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {currentQuestion + 1}/{questions.length} answered
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Coins, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import { budgetMasterQuestions, getRandomQuestions, getUsedQuestions, saveUsedQuestions } from '../../utils/questionPools';

interface BudgetMasterGameProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

export default function BudgetMasterGame({ onClose, onComplete }: BudgetMasterGameProps) {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load random questions on mount
  useEffect(() => {
    const usedIds = getUsedQuestions('budgetMaster');
    const selectedQuestions = getRandomQuestions(budgetMasterQuestions, 3, usedIds);
    
    // Transform to match the old format
    const transformedScenarios = selectedQuestions.map(q => ({
      question: q.question,
      options: q.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        explanation: opt.explanation,
      })),
      coins: q.coinReward,
      questionId: q.id,
    }));
    
    setScenarios(transformedScenarios);
  }, []);

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const scenario = scenarios[currentQuestion];
    const isCorrect = scenario.options[index].isCorrect;
    
    if (isCorrect) {
      setTotalCoins(prev => prev + scenario.coins);
      setCorrectAnswers(prev => prev + 1);
      toast.success(`+${scenario.coins} coins! 🎉`);
    } else {
      toast.error('Wrong answer. Try next one!');
    }
  };

  const handleNext = () => {
    if (currentQuestion < scenarios.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Save used question IDs
      const usedIds = scenarios.map(s => s.questionId);
      saveUsedQuestions('budgetMaster', usedIds);
      onComplete(totalCoins);
    }
  };

  const progress = ((currentQuestion + 1) / scenarios.length) * 100;
  const scenario = scenarios[currentQuestion];

  if (scenarios.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading questions...</span>
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
      <div className="min-h-full w-full flex items-center justify-center py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-background rounded-xl md:rounded-2xl shadow-2xl overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 md:p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl">Budget Master Challenge</h2>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Coins className="w-5 h-5" />
                <span className="font-bold text-lg">{totalCoins}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
            <p className="text-sm text-green-100 mt-2">
              Question {currentQuestion + 1} of {scenarios.length}
            </p>
          </div>

          {/* Question */}
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-semibold mb-6">{scenario.question}</h3>

                <div className="space-y-3">
                  {scenario.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = option.isCorrect;
                    const showResult = showExplanation && isSelected;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: showExplanation ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showExplanation}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                              : 'bg-red-50 dark:bg-red-950/20 border-red-500'
                            : 'border-border hover:border-primary hover:bg-accent'
                        } ${showExplanation && !isSelected ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.text}</span>
                          {showResult && (
                            isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-red-600" />
                            )
                          )}
                        </div>
                        {showResult && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-muted-foreground mt-2"
                          >
                            {option.explanation}
                          </motion.p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {currentQuestion < scenarios.length - 1 ? 'Next Question' : 'Complete Game'}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Score */}
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="font-semibold">
                {correctAnswers}/{scenarios.length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

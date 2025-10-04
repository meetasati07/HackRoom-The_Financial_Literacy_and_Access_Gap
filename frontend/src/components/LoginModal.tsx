import React from 'react';
import { useState } from 'react';
import { X, User, Phone, Mail, Lock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import apiService from '../services/api';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (userData: { name: string; mobile: string; email: string }) => void;
  onRegistrationSuccess: (userData: { name: string; mobile: string; email: string }) => void;
  language?: any;
}

export default function LoginModal({ onClose, onLoginSuccess, onRegistrationSuccess, language }: LoginModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Login fields
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupMobile || !signupEmail || !signupPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!signupEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiService.register({
        name: signupName,
        mobile: signupMobile,
        email: signupEmail,
        password: signupPassword,
      });

      if (response.success) {
        toast.success('Account created successfully! 🎉');
        onRegistrationSuccess({ 
          name: response.data.user.name, 
          mobile: response.data.user.mobile, 
          email: response.data.user.email 
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginMobile || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (loginMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.login(loginMobile, loginPassword);

      if (response.success) {
        toast.success('Login successful! 🎉');
        onLoginSuccess({ 
          name: response.data.user.name, 
          mobile: response.data.user.mobile, 
          email: response.data.user.email 
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="min-h-full w-full flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-5xl bg-background rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left Side - Welcome Content */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl mb-4">Welcome to FinLearn!</h2>
              <p className="text-blue-100 mb-8">
                Start your journey to financial freedom with gamified learning and smart tracking.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Auto Expense Tracking</h4>
                    <p className="text-sm text-blue-100">
                      Connect your UPI and track expenses automatically
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Gamified Learning</h4>
                    <p className="text-sm text-blue-100">
                      Earn coins, badges, and level up your financial knowledge
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Smart Insights</h4>
                    <p className="text-sm text-blue-100">
                      Get personalized tips to save and invest better
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">100% Secure</span>
                </div>
                <p className="text-sm text-blue-100">
                  Your data is encrypted and protected. We never share your information.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Forms */}
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {mode === 'signup' ? (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignup}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl mb-2">Create Your Account</h3>
                    <p className="text-muted-foreground">
                      Join thousands of young adults mastering their finances
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="signup-name" className="mb-2 block">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-mobile" className="mb-2 block">
                        Mobile Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-mobile"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={signupMobile}
                          onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email" className="mb-2 block">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-password" className="mb-2 block">
                        Create Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Already have an account?{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Log in</span>
                      </button>
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl mb-2">Welcome Back!</h3>
                    <p className="text-muted-foreground">
                      Log in to continue your financial journey
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="login-mobile" className="mb-2 block">
                        Mobile Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-mobile"
                          type="tel"
                          placeholder="Enter your mobile number"
                          value={loginMobile}
                          onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="login-password" className="mb-2 block">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                    >
                      {isSubmitting ? 'Logging in...' : 'Log In'}
                      {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Don't have an account?{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Sign up</span>
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
}

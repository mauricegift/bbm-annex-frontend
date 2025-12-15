import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { CheckCircle, RefreshCw, AlertCircle, Mail, Smartphone } from 'lucide-react';
import { toast } from '../../lib/toast';
import { motion } from 'framer-motion';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../../components/ui/input-otp';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const emailFromState = location.state?.email;
    const phoneFromState = location.state?.phone_number;
    const methodFromState = location.state?.verification_method;
    
    if (emailFromState) {
      setEmail(emailFromState);
    }
    if (phoneFromState) {
      setPhoneNumber(phoneFromState);
    }
    if (methodFromState) {
      setVerificationMethod(methodFromState === 'sms' ? 'sms' : 'email');
    }
  }, [location.state]);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
  }, []);

  const handleVerify = async (verificationCode: string) => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await authAPI.verify({ email, code: verificationCode });
      toast({
        title: "Success!",
        description: "Your account has been verified successfully.",
      });
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Verification failed';
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  // Auto-submit when last digit is entered
  const handleCodeChange = (value: string) => {
    setCode(value);
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "No email address found to resend to.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    setShowResend(false);
    setCountdown(60);

    try {
      await authAPI.resendVerification(email);
      toast({
        title: "Code sent!",
        description: verificationMethod === 'sms' 
          ? "A new verification code has been sent to your phone." 
          : "A new verification code has been sent to your email. Please check your spam/junk folder if you don't see it.",
      });

      // Restart countdown after successful resend
      startCountdown();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send code';
      toast({
        title: "Failed to send code",
        description: message,
        variant: "destructive",
      });
      setShowResend(true);
    } finally {
      setIsResending(false);
    }
  };

  const isSMS = verificationMethod === 'sms';
  const displayContact = isSMS ? phoneNumber : email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <motion.div 
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <img 
                  src="/android-chrome-512x512.png" 
                  alt="BBM Annex Logo" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent animate-fade-in">
              Verify Your Account
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm animate-fade-in delay-100">
              {isSMS ? (
                <Smartphone className="w-4 h-4 text-primary" />
              ) : (
                <Mail className="w-4 h-4 text-primary" />
              )}
              <span>
                {isSMS 
                  ? "Enter the code sent to your phone number" 
                  : "Enter the code sent to your email"}
              </span>
            </div>
            {!isSMS && (
              <p className="text-muted-foreground text-xs">
                <span className="font-semibold text-foreground">Check your spam/junk folder</span> if you don't see it.
              </p>
            )}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl animate-fade-in-up">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                {isSMS ? (
                  <Smartphone className="w-4 h-4 text-primary" />
                ) : (
                  <Mail className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-medium text-foreground">{displayContact}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground/90 block text-center">
                  Enter 6-digit verification code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold border-2 border-border/50 bg-background/50 focus:border-primary" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold border-2 border-border/50 bg-background/50 focus:border-primary" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold border-2 border-border/50 bg-background/50 focus:border-primary" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold border-2 border-border/50 bg-background/50 focus:border-primary" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold border-2 border-border/50 bg-background/50 focus:border-primary" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold border-2 border-border/50 bg-background/50 focus:border-primary" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {isLoading && (
                  <p className="text-center text-sm text-primary animate-pulse">Verifying...</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] font-medium"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Account
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  {showResend ? "Didn't receive the code?" : `Resend code in ${countdown} seconds`}
                </p>
                {showResend ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full h-12 transition-all duration-300 hover:bg-background/50"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Code'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="w-full h-12 transition-all duration-300"
                  >
                    Resend Code
                  </Button>
                )}
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Already registered member?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200">
                  Sign In Here
                </Link>
              </div>
            </div>

            {/* Help tips - contextual based on method */}
            <div className={`p-3 ${isSMS ? 'bg-green-50/50 border-green-200/50' : 'bg-blue-50/50 border-blue-200/50'} border rounded-lg text-xs backdrop-blur-sm`}>
              <div className="flex items-start space-x-2">
                <AlertCircle className={`h-4 w-4 ${isSMS ? 'text-green-600' : 'text-blue-600'} mt-0.5 flex-shrink-0`} />
                <div className={isSMS ? 'text-green-800' : 'text-blue-800'}>
                  <p className="font-medium">Can't find the code?</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {isSMS ? (
                      <>
                        <li>Check your SMS inbox</li>
                        <li>Wait a few minutes - messages may take time</li>
                        <li>Make sure you entered a valid phone number</li>
                      </>
                    ) : (
                      <>
                        <li>Check your spam or junk folder</li>
                        <li>Wait a few minutes - emails may take time to arrive</li>
                        <li>Make sure you entered an active correct email address</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;

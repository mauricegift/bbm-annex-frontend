import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '../../lib/toast';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [iconPulse, setIconPulse] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Mail icon animation effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIconPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      toast({
        title: "Reset code sent!",
        description: "Check your email for the password reset code. Check your spam or junk folder",
      });
      setCountdown(60); // Start 1-minute countdown
      navigate('/reset-password', { state: { email } });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send reset code';
      toast({
        title: "Failed to send reset code",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return;
    
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast({
        title: "Reset code resent!",
        description: "Check your email again for the new reset code.",
      });
      setCountdown(60); // Reset 1-minute countdown
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to resend reset code';
      toast({
        title: "Failed to resend reset code",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div 
            className="flex justify-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-sm">
                <img 
                  src="/android-chrome-512x512.png" 
                  alt="BBM Annex Logo" 
                  className={`w-full h-full object-cover transition-all duration-300 ${iconPulse ? 'scale-105' : 'scale-100'} ${isHovering ? 'rotate-12' : 'rotate-0'}`}
                />
              </div>
            </div>
          </div>
                      <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent animate-fade-in">
                Forgot Password?
              </h1>
              <p className="text-muted-foreground text-sm animate-fade-in delay-100">
                We'll send you a reset code to your email
              </p>
            </div>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 animate-fade-in-up delay-100">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'email' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                    focusedField === 'email' ? 'bg-primary/5' : ''
                  }`}></div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 animate-fade-in-up delay-200">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] font-medium"
                  disabled={isLoading || countdown > 0}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Send Reset Code'}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                {countdown > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 transition-all duration-300 hover:bg-background/50"
                    disabled={countdown > 0}
                    onClick={handleResendCode}
                  >
                    Resend Code {countdown > 0 && `(available in ${countdown}s)`}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center text-xs text-muted-foreground animate-fade-in-up delay-300">
              <Link 
                to="/login" 
                className="inline-flex items-center text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform hover:-translate-x-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

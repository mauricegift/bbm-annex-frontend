import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from '../../lib/toast';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lockShake, setLockShake] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setFormData(prev => ({ ...prev, email: emailFromState }));
    }
  }, [location.state]);

  // Trigger lock shake animation when errors occur
  useEffect(() => {
    if (errors.length > 0) {
      setLockShake(true);
      const timer = setTimeout(() => setLockShake(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validation
    const newErrors: string[] = [];
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    
    if (formData.newPassword.length < 8) {
      newErrors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.push('Password must contain at least 1 uppercase letter');
    }

    if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.push('Password must contain at least 1 lowercase letter');
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.push('Password must contain at least 1 number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      newErrors.push('Password must contain at least 1 special character');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword({
        email_or_phone: formData.email,
        code: formData.code,
        new_password: formData.newPassword,
      });
      toast({
        title: "Password reset successful!",
        description: "You can now sign in with your new password.",
      });
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Password reset failed';
      toast({
        title: "Reset failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResendCode = async () => {
    if (!formData.email || resendCountdown > 0) return;
    setIsResending(true);
    try {
      await authAPI.forgotPassword(formData.email);
      toast({
        title: "Reset code resent!",
        description: "Check your email again for the new reset code.",
      });
      setResendCountdown(60);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to resend reset code';
      toast({
        title: "Failed to resend reset code",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
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
                  className={`w-full h-full object-cover transition-all duration-300 ${lockShake ? 'animate-shake' : ''} ${isHovering ? 'scale-105' : 'scale-100'}`}
                />
              </div>
            </div>
          </div>
                      <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent animate-fade-in">
                Reset Password
              </h1>
              <p className="text-muted-foreground text-sm animate-fade-in delay-100">
                Enter your reset code and new password
              </p>
            </div>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            {errors.length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in-up">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive">{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 animate-fade-in-up delay-100">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
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

              <div className="space-y-2 animate-fade-in-up delay-150">
                <Label htmlFor="code" className="text-sm font-medium text-foreground/90">Reset Code</Label>
                <div className="relative group">
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Enter 6-digit reset code"
                    value={formData.code}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('code')}
                    onBlur={() => setFocusedField(null)}
                    required
                    maxLength={6}
                    className={`h-12 text-center text-lg tracking-widest font-mono transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'code' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                    focusedField === 'code' ? 'bg-primary/5' : ''
                  }`}></div>
                </div>
              </div>

              <div className="space-y-2 animate-fade-in-up delay-200">
                <Label htmlFor="newPassword" className="text-sm font-medium text-foreground/90">New Password</Label>
                <div className="relative group">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`h-12 pr-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'newPassword' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                    focusedField === 'newPassword' ? 'bg-primary/5' : ''
                  }`}></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 hover:bg-primary/10 transition-all duration-200 rounded-md"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
                </p>
              </div>

              <div className="space-y-2 animate-fade-in-up delay-250">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">Confirm New Password</Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`h-12 pr-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'confirmPassword' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                    focusedField === 'confirmPassword' ? 'bg-primary/5' : ''
                  }`}></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 hover:bg-primary/10 transition-all duration-200 rounded-md"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-2 animate-fade-in-up delay-200">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 transition-all duration-300 hover:bg-background/50"
                  disabled={isResending || resendCountdown > 0 || !formData.email}
                  onClick={handleResendCode}
                >
                  {isResending ? 'Resending...' : resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code'}
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] font-medium animate-fade-in-up delay-300 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    <span className="transition-transform group-hover:translate-x-1">Reset Password</span>
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground animate-fade-in-up delay-400">
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

export default ResetPassword;

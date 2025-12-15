import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Eye, EyeOff, AlertCircle, Mail, Smartphone, Check, X } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { USER_SPECIALIZATIONS } from '../../lib/specializations';
import { Progress } from '../../components/ui/progress';

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  if (score <= 2) return { score: (score / 6) * 100, label: 'Weak', color: 'bg-destructive' };
  if (score <= 4) return { score: (score / 6) * 100, label: 'Medium', color: 'bg-warning' };
  return { score: (score / 6) * 100, label: 'Strong', color: 'bg-success' };
};

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    year_of_study: '',
    semester_of_study: '',
    specialization: '',
    verification_method: 'email' as 'email' | 'sms',
    phone_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [iconPulse, setIconPulse] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Icon pulse animation effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIconPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  const validateForm = () => {
    const newErrors: string[] = [];

    // Username validation (only lowercase letters)
    if (!/^[a-z0-9]+$/.test(formData.username)) {
      newErrors.push('Username must contain only lowercase letters and numbers');
    }

    // Full name validation (at least 2 names)
    if (formData.name.trim().split(/\s+/).length < 2) {
      newErrors.push('Full name must contain at least 2 names');
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(formData.password)) {
      newErrors.push('Password must contain at least 1 capital letter');
    }
    if (!/[a-z]/.test(formData.password)) {
      newErrors.push('Password must contain at least 1 small letter');
    }
    if (!/[0-9]/.test(formData.password)) {
      newErrors.push('Password must contain at least 1 number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.push('Password must contain at least 1 special character');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    
    if (!formData.year_of_study || !formData.semester_of_study) {
      newErrors.push('Please select your year and semester of study');
    }

    if (parseInt(formData.year_of_study) >= 3 && !formData.specialization) {
      newErrors.push('Please select your specialization for Year 3 and above');
    }

    if (formData.verification_method === 'sms' && !formData.phone_number) {
      newErrors.push('Phone number is required for SMS verification');
    }

    if (formData.phone_number && !/^(07|01)[0-9]{8}$/.test(formData.phone_number)) {
      newErrors.push('Please enter a valid Kenyan phone number (e.g., 0712345678)');
    }

    if (!acceptedTerms) {
      newErrors.push('You must accept the Terms and Conditions to register');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        name: formData.name,
        password: formData.password,
        year_of_study: parseInt(formData.year_of_study),
        semester_of_study: parseInt(formData.semester_of_study),
        specialization: formData.specialization || undefined,
        verification_method: formData.verification_method,
        phone_number: formData.phone_number || undefined,
      });
      navigate('/verify', { state: { email: formData.email, verification_method: formData.verification_method } });
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert username to lowercase as user types
    if (name === 'username') {
      setFormData({
        ...formData,
        [name]: value.toLowerCase(),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
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
                Join BBM Annex
              </h1>
              <p className="text-muted-foreground text-sm animate-fade-in delay-100">
                Create your account to access study materials
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground/90">Full Name *</Label>
                  <div className="relative group">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    required
                      className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                        focusedField === 'name' 
                          ? 'border-primary/50 ring-4 ring-primary/10' 
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                    />
                    <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                      focusedField === 'name' ? 'bg-primary/5' : ''
                    }`}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground/90">Username *</Label>
                  <div className="relative group">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                    required
                      className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm lowercase ${
                        focusedField === 'username' 
                          ? 'border-primary/50 ring-4 ring-primary/10' 
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                    />
                    <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                      focusedField === 'username' ? 'bg-primary/5' : ''
                    }`}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email *</Label>
                <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground/90">Year of Study *</Label>
                  <Select value={formData.year_of_study} onValueChange={(value) => handleSelectChange('year_of_study', value)}>
                    <SelectTrigger className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'year' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground/90">Semester *</Label>
                  <Select value={formData.semester_of_study} onValueChange={(value) => handleSelectChange('semester_of_study', value)}>
                    <SelectTrigger className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'semester' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Specialization field for Year 3+ */}
              {parseInt(formData.year_of_study) >= 3 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground/90">Specialization *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleSelectChange('specialization', value)}>
                    <SelectTrigger className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'specialization' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec.value} value={spec.value}>
                          {spec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Verification Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/90">Verification Method *</Label>
                <Select 
                  value={formData.verification_method} 
                  onValueChange={(value) => handleSelectChange('verification_method', value)}
                >
                  <SelectTrigger className="h-12 transition-all duration-300 border-2 bg-background backdrop-blur-sm border-border/50 hover:border-primary/30">
                    <SelectValue placeholder="Select verification method" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="email" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Verification</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sms" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>SMS Verification</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  We'll send a 6-digit code to verify your account
                </p>
              </div>

              {/* Phone Number field for SMS verification */}
              {formData.verification_method === 'sms' && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="phone_number" className="text-sm font-medium text-foreground/90">Phone Number *</Label>
                  <div className="relative group">
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="0712345678"
                      value={formData.phone_number}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                        focusedField === 'phone' 
                          ? 'border-primary/50 ring-4 ring-primary/10' 
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                    />
                    <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                      focusedField === 'phone' ? 'bg-primary/5' : ''
                    }`}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter a valid Kenyan phone number</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password *</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`h-12 pr-12 transition-all duration-300 border-2 bg-background/50 backdrop-blur-sm ${
                      focusedField === 'password' 
                        ? 'border-primary/50 ring-4 ring-primary/10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-md transition-all duration-300 pointer-events-none ${
                    focusedField === 'password' ? 'bg-primary/5' : ''
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
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${
                        calculatePasswordStrength(formData.password).label === 'Weak' ? 'text-destructive' :
                        calculatePasswordStrength(formData.password).label === 'Medium' ? 'text-warning' : 'text-success'
                      }`}>
                        {calculatePasswordStrength(formData.password).label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${calculatePasswordStrength(formData.password).color}`}
                        style={{ width: `${calculatePasswordStrength(formData.password).score}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-success' : 'text-muted-foreground'}`}>
                        {formData.password.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                        {/[A-Z]/.test(formData.password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                        {/[a-z]/.test(formData.password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Lowercase
                      </div>
                      <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                        {/[0-9]/.test(formData.password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Number
                      </div>
                      <div className={`flex items-center gap-1 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Special character (!@#$%...)
                      </div>
                    </div>
                  </div>
                )}
                {!formData.password && (
                  <p className="text-xs text-muted-foreground">
                    Must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">Confirm Password *</Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
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
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 text-xs animate-fade-in ${
                    formData.password === formData.confirmPassword ? 'text-success' : 'text-destructive'
                  }`}>
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-3 animate-fade-in-up">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] font-medium"
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;

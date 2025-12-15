import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, FileText, Upload, TrendingUp, Clock, Calendar, Sparkles, GraduationCap, RefreshCw } from 'lucide-react';
import { DashboardSkeleton } from '../components/PageSkeletons';
import { Link } from 'react-router-dom';

// Function to get time-based greeting in Nairobi timezone
const getTimeBasedGreeting = () => {
  const now = new Date();
  const nairobiTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
  const hour = nairobiTime.getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

interface DashboardStats {
  available_notes: number;
  available_papers: number;
  my_uploads: number;
  my_papers: number;
  my_notes: number;
}

interface DashboardData {
  greeting: string;
  stats: DashboardStats;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: 'Available Notes',
      value: dashboardData?.stats?.available_notes || 0,
      description: `For Year ${user?.year_of_study}`,
      icon: BookOpen,
      link: '/notes',
      delay: '0ms',
    },
    {
      title: 'Available Papers',
      value: dashboardData?.stats?.available_papers || 0,
      description: `For Year ${user?.year_of_study}`,
      icon: FileText,
      link: '/past-papers',
      delay: '100ms',
    },
    {
      title: 'My Uploads',
      value: dashboardData?.stats?.my_uploads || 0,
      description: 'Total uploads',
      icon: Upload,
      link: '/notes?tab=my-uploads',
      delay: '200ms',
    },
    {
      title: 'My Papers',
      value: dashboardData?.stats?.my_papers || 0,
      description: 'Papers uploaded',
      icon: TrendingUp,
      link: '/past-papers?tab=my-uploads',
      delay: '300ms',
    },
  ];

  const quickActions = [
    {
      title: 'Upload Notes',
      description: 'Share your study materials',
      icon: BookOpen,
      link: '/notes/upload',
      delay: '0ms',
    },
    {
      title: 'Upload Past Paper',
      description: 'Add exam papers',
      icon: FileText,
      link: '/past-papers/upload',
      delay: '100ms',
    },
    {
      title: 'Latest Updates',
      description: 'Check announcements',
      icon: Clock,
      link: '/blog',
      delay: '200ms',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section with Animation */}
      <div className="text-center space-y-4 animate-fade-in relative">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="absolute right-0 top-0"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full animate-scale-in">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {dashboardData?.greeting || `${getTimeBasedGreeting()}, ${user?.name}`}!
          </h1>
          <Sparkles className="absolute -top-2 -right-2 md:right-1/4 w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Ready to continue your academic journey? Access your notes, past papers, and more.
        </p>
      </div>

      {/* Academic Info Card with Glass Effect */}
      <div className="w-full flex justify-center animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="w-full max-w-4xl p-5 rounded-2xl bg-gradient-to-r from-primary/90 to-primary/70 shadow-lg backdrop-blur-sm border border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">Academic Info</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 transition-transform hover:scale-105">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">Year {user?.year_of_study}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 transition-transform hover:scale-105">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">Semester {user?.semester_of_study}</span>
                </div>
                {user?.specialization && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 transition-transform hover:scale-105">
                    <GraduationCap className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">{user.specialization}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 transition-transform hover:scale-105">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm flex items-center">
                    Verified 
                    <span className="ml-2 w-2 h-2 bg-success rounded-full animate-pulse"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Staggered Animation */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link 
                to={stat.link} 
                key={index} 
                className="group animate-fade-in"
                style={{ animationDelay: stat.delay }}
              >
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-primary/80 to-primary/60 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-primary/30 group min-h-[130px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-2 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 transition-all group-hover:scale-110">
                    <Icon className="w-6 h-6 text-white group-hover:text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-0.5 transition-transform group-hover:scale-110">{stat.value}</div>
                  <div className="text-sm font-semibold text-white mb-0.5">{stat.title}</div>
                  <p className="text-xs text-white/80 text-center">{stat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions with Staggered Animation */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link 
                to={action.link} 
                key={index} 
                className="group animate-fade-in"
                style={{ animationDelay: action.delay }}
              >
                <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-primary/80 to-primary/60 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-primary/30 group min-h-[130px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 transition-all group-hover:scale-110 group-hover:rotate-12">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-base font-bold text-white mb-1">{action.title}</div>
                  <div className="text-xs text-white/80 text-center">{action.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
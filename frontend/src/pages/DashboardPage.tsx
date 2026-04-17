import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ProgressChart from '@/components/ProgressChart';
import BadgesPanel from '@/components/BadgesPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Target, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<any[]>([]);
  const [daily, setDaily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, dailyRes] = await Promise.all([
          api.get('/problems'),
          api.get('/daily'),
        ]);
        setProblems(problemsRes.data);
        setDaily(dailyRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!user) return null;

  const solvedProblems = profile?.solvedProblems || [];
  const solvedEasy = problems.filter((p) => p.difficulty === 'Easy' && solvedProblems.includes(p.id)).length;
  const solvedMedium = problems.filter((p) => p.difficulty === 'Medium' && solvedProblems.includes(p.id)).length;
  const solvedHard = problems.filter((p) => p.difficulty === 'Hard' && solvedProblems.includes(p.id)).length;

  const stats = [
    { label: 'Problems Solved', value: solvedProblems.length, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Current Streak', value: `${profile?.streak || 0} days`, icon: Flame, color: 'text-orange-500' },
    { label: 'Easy / Medium / Hard', value: `${solvedEasy} / ${solvedMedium} / ${solvedHard}`, icon: Target, color: 'text-primary' },
    { label: 'Total Problems', value: problems.length, icon: TrendingUp, color: 'text-blue-500' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-foreground">
          Welcome back, {profile?.name || 'Coder'}!
        </h1>
        <p className="text-muted-foreground">Here's your progress overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {daily?.problem && (
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Daily Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{daily.problem.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <DifficultyBadge difficulty={daily.problem.difficulty} />
                  <span className="text-sm text-muted-foreground">{daily.problem.topic}</span>
                </div>
              </div>
              <Link to={`/problems/${daily.problem.id}`}>
                <Button className="gap-2">Solve Now</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <ProgressChart solvedProblems={solvedProblems} problems={problems} />

      <div className="mt-8">
        <BadgesPanel
          solvedProblems={solvedProblems}
          problems={problems}
          maxStreak={profile?.maxStreak || profile?.streak || 0}
          userName={profile?.name || 'Coder'}
        />
      </div>
    </div>
  );
}

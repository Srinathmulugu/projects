import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProblemCard from '@/components/ProblemCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter } from 'lucide-react';
import { defaultProblems } from '@/data/defaultProblems';

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

const normalizeTopic = (topic: string) => {
  const t = (topic || '').trim();
  if (!t) return 'General';
  if (t.toLowerCase() === 'array') return 'Arrays';
  if (t.toLowerCase() === 'string') return 'Strings';
  return t;
};

export default function ProblemsPage() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<any[]>(defaultProblems);
  const [filtered, setFiltered] = useState<any[]>(defaultProblems);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string>('');

  const topics = ['All', ...Array.from(new Set(problems.map((p) => normalizeTopic(p.topic)))).sort()];

  useEffect(() => {
    const topicFromQuery = searchParams.get('topic');
    if (topicFromQuery) {
      setTopic(normalizeTopic(topicFromQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    // Immediately show fallback problems
    setProblems(defaultProblems);
    setFiltered(defaultProblems);
    
    const fetchProblems = async () => {
      try {
        console.log('Fetching problems from API...');
        const res = await api.get('/problems');
        console.log('API response:', res.data);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
          console.log('Using API problems:', res.data.length, 'problems');
          setProblems(res.data);
          setFiltered(res.data);
        } else {
          console.log('API returned empty, keeping default problems');
        }
        setFetchError('');
      } catch (err: any) {
        console.error('Failed to fetch problems:', err);
        console.log('API fetch failed, keeping default fallback problems');
        setFetchError('');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/bookmarks');
        setBookmarks(res.data.bookmarks || []);
      } catch {
        // Not logged in or error
      }
    };

    fetchProblems();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    let result = problems;
    if (search) {
      result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (difficulty !== 'All') {
      result = result.filter((p) => p.difficulty === difficulty);
    }
    if (topic !== 'All') {
      result = result.filter((p) => normalizeTopic(p.topic) === topic);
    }
    setFiltered(result);
  }, [search, difficulty, topic, problems]);

  const handleBookmark = async (problemId: string) => {
    try {
      await api.post('/bookmarks/toggle', { problemId });
      setBookmarks((prev) =>
        prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId]
      );
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Problem Library</h1>
        <p className="text-muted-foreground">Browse and solve coding problems across different topics</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-white/80 bg-white/90 pl-12 shadow-sm placeholder:text-muted-foreground/80 focus-visible:ring-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <Filter className="h-4 w-4 text-muted-foreground mt-1.5" />
        {topics.map((t) => (
          <Button
            key={t}
            variant={topic === t ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTopic(t)}
            className="text-xs"
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {fetchError || (problems.length === 0 ? 'No problems are available yet.' : 'No problems found matching your filters.')}
          </div>
        ) : (
          filtered.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={{ ...problem, topic: normalizeTopic(problem.topic) }}
              isSolved={profile?.solvedProblems?.includes(problem.id)}
              isBookmarked={bookmarks.includes(problem.id)}
              onBookmark={handleBookmark}
            />
          ))
        )}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Showing {filtered.length} of {problems.length} problems
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { aiService } from '@/services/api';
import DifficultyBadge from '@/components/DifficultyBadge';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Loader2, CheckCircle, CircleDashed, ExternalLink, ChevronRight, Sparkles, BookOpen, Wand2 } from 'lucide-react';
import { defaultProblems } from '@/data/defaultProblems';

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, refreshProfile } = useAuth();
  const [problem, setProblem] = useState<any>(null);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [hintLoading, setHintLoading] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userCode, setUserCode] = useState('');
  const [assistantOutput, setAssistantOutput] = useState('');
  const [assistantTitle, setAssistantTitle] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error('Failed to fetch problem:', err);
        const fallbackProblem = defaultProblems.find((problem) => problem.id === id);
        setProblem(fallbackProblem || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const sourceUrl = useMemo(() => {
    if (!problem) return '';
    return problem.sourceUrl || problem.leetcodeUrl || problem.gfgUrl || '';
  }, [problem]);

  const isSolved = !!profile?.solvedProblems?.includes(id);
  const isAttempted = !!profile?.attemptedProblems?.includes(id);

  const handleHint = async () => {
    setHintLoading(true);
    try {
      const res = await api.post('/hint', { problemId: id });
      setHint(res.data.hint);
    } catch {
      setHint('Unable to generate hint. Please try again.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleProgress = async (status: 'attempted' | 'solved' | 'reset') => {
    setProgressLoading(true);
    setMessage('');
    try {
      await api.post(`/problems/${id}/progress`, { status });
      await refreshProfile();
      if (status === 'attempted') setMessage('Marked as attempted.');
      if (status === 'solved') setMessage('Marked as solved. Great work!');
      if (status === 'reset') setMessage('Progress reset for this problem.');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleAssist = async (action: 'hint-steps' | 'explain' | 'optimize') => {
    setAssistantLoading(true);
    setAssistantOutput('');
    setAssistantTitle('');
    try {
      const res = await aiService.assist({ problemId: id!, action, userCode });
      if (action === 'hint-steps') setAssistantTitle('Step-by-Step Hint');
      if (action === 'explain') setAssistantTitle('Solution Explanation');
      if (action === 'optimize') setAssistantTitle('Code Optimization Suggestions');
      setAssistantOutput(res.content);
    } catch (err: any) {
      setAssistantTitle('AI Assistant');
      setAssistantOutput(err.response?.data?.error || 'Unable to generate AI response right now.');
    } finally {
      setAssistantLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs">
              {problem.topic}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                <Button className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Problem Link
                </Button>
              </a>
            ) : (
              <Button variant="outline" disabled>
                No external link available
              </Button>
            )}
            <Button variant="outline" disabled={progressLoading} onClick={() => handleProgress('attempted')}>
              Mark Attempted
            </Button>
            <Button disabled={progressLoading} onClick={() => handleProgress('solved')}>
              Mark Solved
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CircleDashed className="h-4 w-4" />
            Attempted: {isAttempted ? 'Yes' : 'No'}
          </div>
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Solved: {isSolved ? 'Yes' : 'No'}
          </div>
        </div>
        {message ? <p className="mt-2 text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{problem.description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Examples</h3>
            {problem.examples?.map((ex: any, i: number) => (
              <Card key={i} className="bg-muted/50">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Input:</span> <code className="text-xs bg-background px-1 py-0.5 rounded">{ex.input}</code></div>
                      <div><span className="font-medium">Output:</span> <code className="text-xs bg-background px-1 py-0.5 rounded">{ex.output}</code></div>
                      {ex.explanation && <div className="text-muted-foreground">{ex.explanation}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Constraints</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {problem.constraints?.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={handleHint} disabled={hintLoading} className="gap-2">
              {hintLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              Get Hint
            </Button>
            {hint && (
              <Card className="mt-3 border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4 text-sm">
                  <p className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    {hint}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Paste your approach or code to get a better explanation or optimization review.
            </p>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Paste your solution, pseudocode, or approach here..."
              className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleAssist('hint-steps')} disabled={assistantLoading} className="gap-2">
                {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Give Hint Step-by-Step
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAssist('explain')} disabled={assistantLoading} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Explain This Solution
              </Button>
              <Button size="sm" onClick={() => handleAssist('optimize')} disabled={assistantLoading || !userCode.trim()} className="gap-2">
                <Wand2 className="h-4 w-4" />
                Optimize My Code
              </Button>
            </div>
            {assistantOutput && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium text-sm">{assistantTitle}</p>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {assistantOutput}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="testcases">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {(problem.testCases || []).map((tc: any, index: number) => (
                  <div key={index} className="rounded-md border bg-muted/40 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Test Case {index + 1}</p>
                    <p className="text-sm mt-1"><span className="font-medium">Input:</span> <code>{tc.input}</code></p>
                    <p className="text-sm"><span className="font-medium">Expected Output:</span> <code>{tc.expectedOutput}</code></p>
                  </div>
                ))}
                {(!problem.testCases || problem.testCases.length === 0) && (
                  <p className="text-sm text-muted-foreground">No test cases configured for this problem.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

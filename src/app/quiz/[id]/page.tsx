"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../../components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";

export default function TakeQuiz() {
    const params = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const handleNext = () => {
        if (currentQuestion < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    useEffect(() => {
        fetch("/api/quizzes")
            .then((res) => res.json())
            .then((data: Quiz[]) => {
                const found = data.find((q) => q.id === params.id);
                setQuiz(found || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!quiz) return <div className="flex h-screen items-center justify-center">Quiz not found</div>;

    const handleAnswer = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleQuestionSubmit = async (index: number) => {
        if (!name) return alert("Please enter your name above first.");

        const q = quiz.questions[index];
        const isCorrect = q.correctAnswer && answers[index] === q.correctAnswer;
        const pointsAwarded = isCorrect ? (q.points || 1) : 0;

        const newScore = score + pointsAwarded;
        setScore(newScore);

        const newSubmitted = new Set(submittedQuestions);
        newSubmitted.add(index);
        setSubmittedQuestions(newSubmitted);

        // Incremental API Update
        await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId: quiz.id,
                studentName: name,
                studentId: studentId,
                score: newScore,
                totalPoints: quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0)
            })
        });
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 max-w-md mx-auto">
                <Card className="w-full text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
                        <CardDescription>Great job, {name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-6xl font-bold text-primary">{score}</div>
                        <p className="text-muted-foreground">Total Points</p>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button onClick={() => router.push('/')}>Return Home</Button>
                    </CardFooter>
                </Card>

                <LiveLeaderboard quizId={quiz.id} currentScore={score} />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <p className="text-muted-foreground">{quiz.description}</p>

                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Student Name</label>
                                <Input placeholder="Full Name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Student ID</label>
                                <Input placeholder="e.g. 12345" value={studentId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentId(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={`space-y-6 transition-opacity duration-500 ${!name || !studentId ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100'}`}>
                {/* Single Question View */}
                {(() => {
                    const q = quiz.questions[currentQuestion];
                    const index = currentQuestion;
                    const isAnswered = !!answers[index];
                    const isSubmitted = submittedQuestions.has(index);

                    return (
                        <Card key={index} className="min-h-[400px] flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">
                                        Question {index + 1} <span className="text-muted-foreground text-sm font-normal">/ {quiz.questions.length}</span>
                                    </CardTitle>
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">{q.points || 1} pts</span>
                                </div>
                                <CardDescription className="text-xl text-foreground mt-4 font-medium">{q.text}</CardDescription>
                                {q.image && (
                                    <div className="mt-4 rounded-lg overflow-hidden border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={q.image} alt="Question" className="w-full max-h-96 object-contain bg-muted/20" />
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {q.type === 'multiple-choice' ? (
                                    <div className="grid gap-3">
                                        {q.options?.map((opt, i) => (
                                            <Button
                                                key={i}
                                                disabled={isSubmitted}
                                                variant={answers[index] === opt ? "default" : "outline"}
                                                className={`justify-start h-auto py-4 px-6 text-lg whitespace-normal text-left ${answers[index] === opt ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                onClick={() => handleAnswer(index.toString(), opt)}
                                            >
                                                <div className="flex gap-3">
                                                    <span className="font-mono text-muted-foreground opacity-50">{String.fromCharCode(65 + i)}.</span>
                                                    {opt}
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <Input
                                        disabled={isSubmitted}
                                        placeholder="Type your answer here..."
                                        value={answers[index] || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswer(index.toString(), e.target.value)}
                                        className="text-lg p-6"
                                    />
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t bg-muted/5 p-6">
                                <Button variant="ghost" onClick={handlePrev} disabled={currentQuestion === 0}>
                                    Previous
                                </Button>

                                {isSubmitted ? (
                                    <div className="flex gap-4">
                                        <span className="text-sm font-semibold text-green-600 flex items-center gap-2 px-4 py-2 bg-green-50 rounded-md border border-green-200">
                                            ✓ Submitted
                                        </span>
                                        <Button onClick={handleNext} disabled={currentQuestion === quiz.questions.length - 1}>
                                            Next
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleQuestionSubmit(index)}
                                            disabled={!isAnswered}
                                            className="min-w-[120px]"
                                        >
                                            Submit Answer
                                        </Button>
                                        <Button variant="secondary" onClick={handleNext} disabled={currentQuestion === quiz.questions.length - 1}>
                                            Skip / Next
                                        </Button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })()}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-sm z-50">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">
                        Score: {score} Pts
                    </span>
                    <Button size="lg" onClick={() => setSubmitted(true)} disabled={submittedQuestions.size !== quiz.questions.length}>
                        Finish Quiz
                    </Button>
                </div>
            </div>
        </div>
    );
}

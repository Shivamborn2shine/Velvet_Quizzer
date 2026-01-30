"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Quiz } from "@/types/quiz";

export default function AdminDashboard() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        fetch("/api/quizzes")
            .then((res) => res.json())
            .then((data) => setQuizzes(data))
            .catch((err) => console.error(err));
    }, []);

    const deleteQuiz = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent card click
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const res = await fetch(`/api/quizzes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setQuizzes(quizzes.filter(q => q.id !== id));
            } else {
                alert("Failed to delete quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting quiz");
        }
    };

    const handleLogout = async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh(); // clear client state if any
    };

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>

            <div className="p-6 border rounded-xl bg-card shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Manage Quizzes</h2>
                    <Button asChild>
                        <Link href="/admin/create">Create New Quiz</Link>
                    </Button>
                </div>

                {quizzes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No quizzes created yet. Start by creating one!</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {quizzes.map((quiz) => (
                            <Card key={quiz.id}>
                                <CardHeader>
                                    <CardTitle>{quiz.title}</CardTitle>
                                    <CardDescription>{quiz.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">Top Questions: {quiz.questions.length}</div>
                                        <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                                            Code: {quiz.accessCode}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/quiz/${quiz.id}/results`)}>
                                            Leaderboard
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/edit/${quiz.id}`)}>
                                            Edit
                                        </Button>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => deleteQuiz(quiz.id, e)}
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

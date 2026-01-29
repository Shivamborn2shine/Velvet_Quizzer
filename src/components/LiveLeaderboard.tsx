"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QuizResult } from "@/types/quiz";

interface LiveLeaderboardProps {
    quizId: string;
    currentScore?: number;
}

export function LiveLeaderboard({ quizId, currentScore }: LiveLeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);

    useEffect(() => {
        const fetchResults = () => {
            fetch(`/api/results?quizId=${quizId}`)
                .then(res => res.json())
                .then(data => setLeaderboard(data))
                .catch(err => console.error("Failed to fetch leaderboard", err));
        };

        // Initial fetch
        fetchResults();

        // Poll every 3 seconds
        const interval = setInterval(fetchResults, 3000);
        return () => clearInterval(interval);
    }, [quizId]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Live Leaderboard
                    <span className="text-xs font-normal text-muted-foreground animate-pulse">● Live</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {leaderboard.map((entry, i) => {
                        let rowClass = "bg-muted/50 text-muted-foreground"; // Default
                        let badgeClass = "bg-gray-200 text-gray-600";

                        if (i === 0) {
                            rowClass = "bg-yellow-100 border border-yellow-300 text-yellow-900 shadow-sm"; // Gold
                            badgeClass = "bg-yellow-500 text-white";
                        } else if (i === 1) {
                            rowClass = "bg-red-100 border border-red-300 text-red-900 shadow-sm"; // Red
                            badgeClass = "bg-red-500 text-white";
                        } else if (i === 2) {
                            rowClass = "bg-white border border-gray-200 text-gray-900 shadow-sm"; // White
                            badgeClass = "bg-gray-700 text-white";
                        }

                        return (
                            <div key={i} className={`flex justify-between items-center p-3 rounded-md transition-colors ${rowClass}`}>
                                <span className="font-medium flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}>
                                        {i + 1}
                                    </span>
                                    {entry.studentName} {entry.studentId ? <span className="text-muted-foreground font-normal ml-1">({entry.studentId})</span> : ""}
                                </span>
                                <span className="font-bold">{entry.score} pts</span>
                            </div>
                        );
                    })}
                    {leaderboard.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Waiting for results...</p>}

                    {currentScore !== undefined && (
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-primary">
                            <span className="font-medium">You</span>
                            <span className="font-bold text-lg">{currentScore} pts</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

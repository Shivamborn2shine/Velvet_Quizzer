"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function QuizResults() {
    const params = useParams();

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild>
                    <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                </Button>
                <h1 className="text-2xl font-bold">Quiz Results & Leaderboard</h1>
            </div>

            <LiveLeaderboard quizId={params.id as string} />
        </div>
    );
}

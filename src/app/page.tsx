"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, Lock, ArrowRight } from "lucide-react";
import { Quiz } from "@/types/quiz";

export default function Home() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleJoin = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setError("");

        try {
            // In a larger app, we'd have a specific /api/join endpoint.
            // For now, we'll fetch all and filter.
            const res = await fetch("/api/quizzes");
            const quizzes: Quiz[] = await res.json();

            const found = quizzes.find(q => q.accessCode === code.trim());

            if (found) {
                router.push(`/quiz/${found.id}`);
            } else {
                setError("Invalid access code. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            setError("Communication error. Check connection.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Gradient/Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />

            {/* Header / Config */}
            <div className="absolute top-6 right-6">
                <Button variant="ghost" onClick={() => router.push('/admin/login')} className="gap-2">
                    <Lock className="h-4 w-4" /> Instructor Login
                </Button>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4 shadow-inner ring-1 ring-primary/20">
                        <Shield className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Intrusion</h1>
                    <p className="text-muted-foreground text-lg">Enter your access code to begin.</p>
                </div>

                <Card className="border-primary/10 shadow-2xl bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Student Access</CardTitle>
                        <CardDescription>Input the unique code provided by your instructor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Access Code (e.g. SEC101)"
                                className="text-center text-lg uppercase tracking-widest h-12"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    setError("");
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                            {error && <p className="text-sm text-destructive text-center font-medium animate-in slide-in-from-top-1">{error}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-12 text-lg gap-2" onClick={handleJoin} disabled={loading}>
                            {loading ? "Verifying..." : <>Join Session <ArrowRight className="h-4 w-4" /></>}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Upload } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Quiz } from "@/types/quiz";

export default function EditQuiz() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);

    // Quiz State
    const [quizId, setQuizId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [questions, setQuestions] = useState<any[]>([
        { text: "", type: "text", options: [], points: 1, correctAnswer: "" }
    ]);

    // Bulk Import State
    const [bulkText, setBulkText] = useState("");
    const [showBulk, setShowBulk] = useState(false);

    // Load Quiz Data
    useEffect(() => {
        if (!params.id) return;

        const fetchQuiz = async () => {
            try {
                const res = await fetch("/api/quizzes");
                const data: Quiz[] = await res.json();
                const found = data.find(q => q.id === params.id);

                if (found) {
                    setQuizId(found.id);
                    setTitle(found.title);
                    setDescription(found.description);
                    setAccessCode(found.accessCode);
                    setQuestions(found.questions || []);
                } else {
                    alert("Quiz not found");
                    router.push("/admin");
                }
            } catch (error) {
                console.error("Failed to load quiz", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [params.id, router]);

    const handleBulkImport = () => {
        if (!bulkText.trim()) return;

        const newQuestions: any[] = [];
        const blocks = bulkText.split(/(?=\n\d+\.)|(?=\nQ\.)/g).filter(b => b.trim().length > 0);
        const chunks = blocks.length > 0 ? blocks : [bulkText];

        chunks.forEach(chunk => {
            const lines = chunk.trim().split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) return;

            let questionText = "";
            let options: string[] = [];
            let correctAnswer = "";
            let readingOptions = false;

            const optionRegex = /^\s*([A-Z])[\.)]\s*/i;
            const correctRegex = /^\s*(?:✅\s*)?(?:Correct Answer|Correct|Ans|Answer|Key)[:\s-]*([A-Z])/i;

            for (let line of lines) {
                if (correctRegex.test(line)) {
                    const match = line.match(correctRegex);
                    if (match) {
                        const letter = match[1].toUpperCase();
                        const index = letter.charCodeAt(0) - 65;
                        if (index >= 0 && index < options.length) {
                            correctAnswer = options[index];
                        }
                    }
                } else if (optionRegex.test(line)) {
                    readingOptions = true;
                    const optText = line.replace(optionRegex, '').trim();
                    options.push(optText);
                } else {
                    if (!readingOptions && !line.startsWith("✅")) {
                        const cleanLine = line.replace(/^\d+\.\s*/, '');
                        questionText += (questionText ? " " : "") + cleanLine;
                    }
                }
            }

            if (questionText && options.length > 0) {
                newQuestions.push({
                    text: questionText,
                    type: "multiple-choice",
                    options: options,
                    correctAnswer: correctAnswer,
                    points: 1
                });
            }
        });

        if (newQuestions.length > 0) {
            setQuestions([...questions, ...newQuestions]);
            setBulkText("");
            setShowBulk(false);
            alert(`Imported ${newQuestions.length} questions!`);
        } else {
            alert("Could not parse any questions.");
        }
    };

    const magicFormat = () => {
        let text = bulkText;
        if (!text) return;
        text = text.replace(/(?:^|\n)Q\.?\s?(\d+)[:.)]/gim, "\n$1.");
        text = text.replace(/(?:^|\n)Q(\d+)\./gim, "\n$1.");
        text = text.replace(/(?:^|\n)(?:\(?([a-d])[).]\s?)/gim, (match, p1) => `\n${p1.toUpperCase()}. `);
        text = text.replace(/(?:^|\n)\s*(?:Ans|Answer|Correct Option|Correct|Key)[:\s-]*([A-D])(?:$|\n)/gim, "\n✅ Correct Answer: $1\n");
        text = text.replace(/(\n✅ Correct Answer: [A-D])\s*(\d+\.)/g, "$1\n\n$2");
        text = text.replace(/\n{3,}/g, "\n\n");
        setBulkText(text);
        alert("✨ Text normalized! Please review then click 'Process'.");
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: "", type: "text", options: [], points: 1, correctAnswer: "" }]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title) {
            alert("Title is required");
            return;
        }

        const res = await fetch("/api/quizzes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: quizId,
                title,
                description,
                questions,
                accessCode // preserve existing code
            }),
        });

        if (res.ok) {
            alert("Quiz updated successfully!");
            router.push("/admin");
        } else {
            alert("Failed to update quiz");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-bold">Edit Quiz</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Quiz Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cybersecurity Basics" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} placeholder="Short description..." />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Access Code (Read-only)</label>
                    <Input value={accessCode} disabled className="bg-muted" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Questions</h2>

                <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={() => setShowBulk(!showBulk)}>
                        {showBulk ? "Hide Import" : "⚡ Bulk Import from Text"}
                    </Button>
                </div>

                {showBulk && (
                    <Card className="mb-6 border-dashed border-2 bg-muted/50">
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paste Questions</label>
                                <textarea
                                    className="w-full min-h-[200px] p-3 rounded-md border text-sm font-mono"
                                    value={bulkText}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBulkText(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={magicFormat} variant="secondary" className="w-1/3">✨ AI Format Fixer</Button>
                                <Button onClick={handleBulkImport} className="flex-1">Process Text & Add Questions</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {questions.map((q, index) => (
                    <Card key={index} className="relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeQuestion(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardHeader>
                            <CardTitle>Question {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={q.text}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, "text", e.target.value)}
                                        placeholder="Question Text"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            value={q.image || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, "image", e.target.value)}
                                            placeholder="Image URL"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id={`file-${index}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append("file", file);
                                                    try {
                                                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                        const data = await res.json();
                                                        if (data.url) updateQuestion(index, "image", data.url);
                                                    } catch (err) { alert("Error uploading image"); }
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => document.getElementById(`file-${index}`)?.click()}
                                                type="button"
                                            >
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {q.image && (
                                        <div className="mt-2 relative w-full h-32 bg-muted/20 rounded-md overflow-hidden border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={q.image} alt="Preview" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <Input
                                        value={q.correctAnswer}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, "correctAnswer", e.target.value)}
                                        placeholder="Correct Answer"
                                        className={q.type === "multiple-choice" ? "hidden" : ""}
                                    />
                                </div>
                                <div className="w-24">
                                    <Input
                                        type="number"
                                        value={q.points}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, "points", parseInt(e.target.value))}
                                        placeholder="Pts"
                                    />
                                </div>
                                <select
                                    className="bg-background border rounded-md px-3 text-sm h-10"
                                    value={q.type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateQuestion(index, "type", e.target.value)}
                                >
                                    <option value="text">Text Input</option>
                                    <option value="multiple-choice">Select</option>
                                </select>
                            </div>

                            {q.type === "multiple-choice" && (
                                <div className="pl-4 space-y-2 border-l-2">
                                    <p className="text-xs font-semibold text-muted-foreground">Options</p>
                                    {q.options.map((opt: string, optIndex: number) => (
                                        <div key={optIndex} className={`flex items-center gap-2 p-2 rounded ${q.correctAnswer === opt && opt !== "" ? "bg-green-100 dark:bg-green-900/30 border border-green-500" : ""}`}>
                                            <input
                                                type="radio"
                                                name={`correct-${index}`}
                                                checked={q.correctAnswer === opt && opt !== ""}
                                                onChange={() => updateQuestion(index, "correctAnswer", opt)}
                                                className="accent-green-600 h-4 w-4"
                                            />
                                            <Input
                                                value={opt}
                                                className="h-8 flex-1"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newOptions = [...q.options];
                                                    newOptions[optIndex] = e.target.value;
                                                    updateQuestion(index, "options", newOptions);
                                                    if (q.correctAnswer === opt) updateQuestion(index, "correctAnswer", e.target.value);
                                                }}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    const newOptions = q.options.filter((_: string, i: number) => i !== optIndex);
                                                    updateQuestion(index, "options", newOptions);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newOptions = [...(q.options || []), ""];
                                            updateQuestion(index, "options", newOptions);
                                        }}
                                    >
                                        <Plus className="mr-2 h-3 w-3" /> Add Option
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                <Button onClick={addQuestion} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => router.push("/admin")}>Cancel</Button>
                <Button onClick={handleSubmit}>Update Quiz</Button>
            </div>
        </div>
    );
}

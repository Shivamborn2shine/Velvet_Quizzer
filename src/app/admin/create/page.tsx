"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateQuiz() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<any[]>([
        { text: "", type: "text", options: [], points: 1, correctAnswer: "" }
    ]);
    const [bulkText, setBulkText] = useState("");
    const [showBulk, setShowBulk] = useState(false);

    const handleBulkImport = () => {
        if (!bulkText.trim()) return;

        const newQuestions: any[] = [];
        // Split by Double Newlines (assuming questions are separated by blank lines)
        // Or regex lookahead for "N." start pattern
        const blocks = bulkText.split(/(?=\n\d+\.)|(?=\nQ\.)/g).filter(b => b.trim().length > 0);

        // Fallback: if user just pasted one block without number, try to parse it as one
        const chunks = blocks.length > 0 ? blocks : [bulkText];

        chunks.forEach(chunk => {
            const lines = chunk.trim().split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) return;

            // 1. Extract Question Text (First line(s) before options)
            let questionText = "";
            let options: string[] = [];
            let correctAnswer = "";
            let readingOptions = false;

            const optionRegex = /^\s*([A-Z])[\.)]\s*/i;
            const correctRegex = /^\s*(?:✅\s*)?(?:Correct Answer|Correct|Ans|Answer|Key)[:\s-]*([A-Z])/i; // Updated regex

            for (let line of lines) {
                if (correctRegex.test(line)) {
                    // It's the answer line
                    const match = line.match(correctRegex);
                    if (match) {
                        const letter = match[1].toUpperCase(); // e.g., 'B'
                        const index = letter.charCodeAt(0) - 65; // A=0, B=1...
                        if (index >= 0 && index < options.length) {
                            correctAnswer = options[index];
                        }
                    }
                } else if (optionRegex.test(line)) {
                    // It's an option line like "A. Phishing"
                    readingOptions = true;
                    // strip "A. "
                    const optText = line.replace(optionRegex, '').trim();
                    options.push(optText);
                } else {
                    // It's part of the question text
                    if (!readingOptions && !line.startsWith("✅")) {
                        // Remove leading numbering like "3."
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
            // Remove the empty default question if it's untouched
            if (questions.length === 1 && !questions[0].text) {
                setQuestions(newQuestions);
            } else {
                setQuestions([...questions, ...newQuestions]);
            }
            setBulkText("");
            setShowBulk(false);
            alert(`Imported ${newQuestions.length} questions!`);
        } else {
            alert("Could not parse any questions. Check format.");
        }
    };

    // AI/Heuristic Formatter to normalize messy inputs
    const magicFormat = () => {
        let text = bulkText;
        if (!text) return;

        // 0. Normalize Question Prefixes: "Q1.", "Q1)", "Q.1." -> "1."
        text = text.replace(/(?:^|\n)Q\.?\s?(\d+)[:.)]/gim, "\n$1.");
        text = text.replace(/(?:^|\n)Q(\d+)\./gim, "\n$1.");

        // 1. Normalize Options: "a) ", "(a) ", "A) " -> "A. "
        text = text.replace(/(?:^|\n)(?:\(?([a-d])[).]\s?)/gim, (match, p1) => {
            return `\n${p1.toUpperCase()}. `;
        });

        // 2. Normalize Answer Keys: "Ans: B", "Answer: B" -> "✅ Correct Answer: B"
        text = text.replace(/(?:^|\n)\s*(?:Ans|Answer|Correct Option|Correct|Key)[:\s-]*([A-D])(?:$|\n)/gim, "\n✅ Correct Answer: $1\n");

        // 3. Ensure double newlines between questions
        text = text.replace(/(\n✅ Correct Answer: [A-D])\s*(\d+\.)/g, "$1\n\n$2");

        // 4. Clean up excessive newlines
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
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        if (!title) {
            alert("Title is required");
            return;
        }

        const res = await fetch("/api/quizzes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, questions }),
        });

        if (res.ok) {
            router.push("/admin");
        } else {
            alert("Failed to create quiz");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-bold">Create New Quiz</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Quiz Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cybersecurity Basics" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} placeholder="Short description..." />
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
                                <label className="text-sm font-medium">Paste Questions (Format: "1. Question... A. Option... ✅ Correct Answer: Letter")</label>
                                <textarea
                                    className="w-full min-h-[200px] p-3 rounded-md border text-sm font-mono"
                                    placeholder={`3. You are a security analyst...
Which technique would attackers use?

A. Phishing
B. Google Dorking
C. Brute force attack
✅ Correct Answer: B`}
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
                                            placeholder="Image URL (or upload ->)"
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
                                                        const res = await fetch("/api/upload", {
                                                            method: "POST",
                                                            body: formData,
                                                        });
                                                        const data = await res.json();
                                                        if (data.url) {
                                                            updateQuestion(index, "image", data.url);
                                                        } else {
                                                            alert("Upload failed");
                                                        }
                                                    } catch (err) {
                                                        alert("Error uploading image");
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => document.getElementById(`file-${index}`)?.click()}
                                                type="button"
                                                title="Upload Image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                            </Button>
                                        </div>
                                    </div>
                                    <Input
                                        value={q.correctAnswer}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, "correctAnswer", e.target.value)}
                                        placeholder="Correct Answer (Exact Match)"
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
                                        <div
                                            key={optIndex}
                                            className={`flex items-center gap-2 p-2 rounded transition-colors ${q.correctAnswer === opt && opt !== "" ? "bg-green-100 dark:bg-green-900/30 border border-green-500" : ""}`}
                                        >
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
                                                    // Auto-update correct answer if the option text changes and it was selected
                                                    if (q.correctAnswer === opt) {
                                                        updateQuestion(index, "correctAnswer", e.target.value);
                                                    }
                                                }}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                <Button onClick={handleSubmit}>Create Quiz</Button>
            </div>
        </div>
    );
}

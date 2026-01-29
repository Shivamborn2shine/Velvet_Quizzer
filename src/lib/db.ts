import { Quiz } from "@/types/quiz";


import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const quizzesFile = path.join(dataDir, "quizzes.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readQuizzes(): Quiz[] {
    if (!fs.existsSync(quizzesFile)) {
        return [];
    }
    try {
        const fileContent = fs.readFileSync(quizzesFile, "utf-8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading quizzes file:", error);
        return [];
    }
}

function writeQuizzes(quizzes: Quiz[]) {
    try {
        fs.writeFileSync(quizzesFile, JSON.stringify(quizzes, null, 2));
    } catch (error) {
        console.error("Error writing quizzes file:", error);
    }
}

// Initial load (optional, but good for caching if we wanted to keep memory sync)
// For this implementation, we will read from disk on every request to ensure consistency across serverless fn invocations if this were deployed, 
// though for local dev it's also safer for persistence.

export function addQuiz(quiz: Quiz) {
    const currentQuizzes = readQuizzes();
    currentQuizzes.push(quiz);
    writeQuizzes(currentQuizzes);
}

export function getQuizzes() {
    return readQuizzes();
}

export function getQuizByCode(code: string) {
    const currentQuizzes = readQuizzes();
    return currentQuizzes.find((q) => q.accessCode === code);
}

export function deleteQuiz(id: string) {
    let currentQuizzes = readQuizzes();
    const initialLength = currentQuizzes.length;
    currentQuizzes = currentQuizzes.filter((q) => q.id !== id);
    if (currentQuizzes.length !== initialLength) {
        writeQuizzes(currentQuizzes);
    }
}

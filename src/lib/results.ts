import { QuizResult } from "@/types/quiz";

const globalForResults = global as unknown as { results: QuizResult[] };

import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const resultsFile = path.join(dataDir, "results.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readResults(): QuizResult[] {
    if (!fs.existsSync(resultsFile)) {
        return [];
    }
    try {
        const fileContent = fs.readFileSync(resultsFile, "utf-8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading results file:", error);
        return [];
    }
}

function writeResults(results: QuizResult[]) {
    try {
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error writing results file:", error);
    }
}

export const results = readResults(); // Keep for compatibility if directly imported elsewhere, but functions should use file IO.

export function addResult(result: QuizResult) {
    const currentResults = readResults();
    const existingIndex = currentResults.findIndex(
        (r) => r.quizId === result.quizId && r.studentName === result.studentName
    );

    if (existingIndex !== -1) {
        currentResults[existingIndex] = result;
    } else {
        currentResults.push(result);
    }
    writeResults(currentResults);
}

export function getResults(quizId: string) {
    const currentResults = readResults();
    return currentResults.filter(r => r.quizId === quizId).sort((a, b) => b.score - a.score);
}

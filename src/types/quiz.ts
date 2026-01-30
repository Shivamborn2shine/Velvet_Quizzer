export interface Question {
    text: string;
    type: "multiple-choice" | "text";
    options?: string[]; // Only for multiple-choice
    correctAnswer?: string;
    points?: number;
    image?: string; // Optional image URL
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    accessCode: string;
    questions: Question[];
    active?: boolean;
}

export interface QuizResult {
    quizId: string;
    studentName: string;
    studentId?: string;
    score: number;
    totalPoints: number;
    submittedAt?: number;
}

import { NextResponse } from "next/server";
import { getQuizzes, addQuiz } from "@/lib/db";
import { Quiz } from "@/types/quiz";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    return NextResponse.json(getQuizzes());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.questions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newQuiz: Quiz = {
            id: uuidv4(),
            title: body.title,
            description: body.description || "",
            questions: body.questions,
            active: true,
            accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Random 6 charts
        };

        addQuiz(newQuiz);

        return NextResponse.json(newQuiz);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Dynamic import to avoid circular dep issues in some envs, though simple import works here
    const { deleteQuiz } = await import("@/lib/db");
    deleteQuiz(id);

    return NextResponse.json({ success: true });
}

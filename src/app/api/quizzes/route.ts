import { NextResponse } from "next/server";
import { getQuizzes, addQuiz } from "@/lib/db";
import { Quiz } from "@/types/quiz";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    return NextResponse.json(await getQuizzes());
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

        await addQuiz(newQuiz);

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
    await deleteQuiz(id);

    return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (!body.id || !body.title || !body.questions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // We reuse the existing quiz structure. Use addQuiz (which does setDoc) to overwrite.
        // We'll trust the accessCode from the body or existing, 
        // normally we should probably fetch existing to ensure we don't accidentally lose fields if partial body sent,
        // but for this simple app assuming full body update is okay.

        // Actually, to be safe, let's just save what we get, but assuming the client sends the full object.
        const updatedQuiz: Quiz = {
            id: body.id,
            title: body.title,
            description: body.description || "",
            questions: body.questions,
            active: body.active !== false, // default true
            accessCode: body.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
        };

        await addQuiz(updatedQuiz);

        return NextResponse.json(updatedQuiz);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

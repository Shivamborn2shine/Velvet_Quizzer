import { NextResponse } from "next/server";
import { addResult, getResults } from "@/lib/results";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Validation: Ensure required fields exist
        if (!body.quizId || !body.studentName || body.score === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // We pass the whole body which now includes studentId
        await addResult(body);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Invalid request" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
        return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    return NextResponse.json(await getResults(quizId));
}

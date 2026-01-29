import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const { password } = await request.json();

    // Simple hardcoded check for demo
    if (password === "Velvet10") {
        // Set cookie
        (await cookies()).set("admin_token", "authorized", {
            secure: true,
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 // 1 day
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
    (await cookies()).delete("admin_token");
    return NextResponse.json({ success: true });
}

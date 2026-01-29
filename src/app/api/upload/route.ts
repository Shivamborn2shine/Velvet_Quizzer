import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads
        const uploadsDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (e) {
            // ignore if exists
        }

        // Unique name
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = join(uploadsDir, filename);

        await writeFile(filePath, buffer);

        // Return path relative to public
        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

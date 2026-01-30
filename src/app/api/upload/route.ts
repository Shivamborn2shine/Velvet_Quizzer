import { NextResponse } from "next/server";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);

        // Save to Firebase Storage
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const storageRef = ref(storage, `uploads/${filename}`);

        await uploadBytes(storageRef, buffer);
        const url = await getDownloadURL(storageRef);

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

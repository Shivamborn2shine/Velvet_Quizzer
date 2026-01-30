import { db } from "./firebase";
import { collection, getDocs, addDoc, query, where, orderBy, setDoc, doc } from "firebase/firestore";
import { QuizResult } from "@/types/quiz";

const COLLECTION_NAME = "results";

export async function addResult(result: QuizResult) {
    // We want to upsert: if user+quiz exists, update it.
    // However, Firestore doesn't have a simple "upsert on custom fields" without a known ID.
    // We can query first.

    // Check if result exists for this student and quiz
    const q = query(
        collection(db, COLLECTION_NAME),
        where("quizId", "==", result.quizId),
        where("studentName", "==", result.studentName) // ideally we use studentId if available, but staying consistent with old logic
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        // Update existing
        const docId = snapshot.docs[0].id;
        await setDoc(doc(db, COLLECTION_NAME, docId), result, { merge: true });
    } else {
        // Add new
        await addDoc(collection(db, COLLECTION_NAME), result);
    }
}

export async function getResults(quizId: string): Promise<QuizResult[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("quizId", "==", quizId)
        // Note: Client-side sorting is often cheaper for small datasets, 
        // but we can add orderBy("score", "desc") if we create an index.
        // For now, let's sort in memory to avoid "index needed" errors blocking the user immediately.
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => doc.data() as QuizResult);

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}

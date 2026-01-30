import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { Quiz } from "@/types/quiz";

const COLLECTION_NAME = "quizzes";

export async function addQuiz(quiz: Quiz) {
    // structuredClone is used to remove undefined fields if any, as Firestore doesn't like them
    // or just pass the object if we are sure. JSON.parse(JSON.stringify) is a safe bet for complex objects
    const quizData = JSON.parse(JSON.stringify(quiz));
    await setDoc(doc(db, COLLECTION_NAME, quiz.id), quizData);
}

export async function getQuizzes(): Promise<Quiz[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => doc.data() as Quiz);
}

export async function getQuizByCode(code: string): Promise<Quiz | undefined> {
    const q = query(collection(db, COLLECTION_NAME), where("accessCode", "==", code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return undefined;
    return querySnapshot.docs[0].data() as Quiz;
}

export async function deleteQuiz(id: string) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

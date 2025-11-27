import { fireApp } from "../../firebase-config.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

const db = getFirestore(fireApp);

export async function saveUserProfile(uid, data) {
    await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getUserProfile(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
}
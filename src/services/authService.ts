import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export async function loginWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    return credential.user
}

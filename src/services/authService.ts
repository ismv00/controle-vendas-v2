import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  linkWithPopup,
  unlink,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);

  return credential.user;
}

// Vincula o Google à conta JÁ autenticada, mantendo o mesmo uid (e todos os dados dele).
export async function linkGoogleToCurrentUser() {
  if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');

  const credential = await linkWithPopup(auth.currentUser, googleProvider);

  return credential.user;
}

// Remove o login por senha da conta atual, deixando apenas o Google (ou outros provedores já vinculados).
export async function unlinkPasswordFromCurrentUser() {
  if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');

  await unlink(auth.currentUser, 'password');
}

export function getCurrentUserProviders(): string[] {
  return auth.currentUser?.providerData.map((p) => p.providerId) ?? [];
}

export async function registerWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

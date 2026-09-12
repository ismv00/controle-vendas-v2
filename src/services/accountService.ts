import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';

// Coleções onde os documentos guardam um campo `userId` apontando pro dono.
const USER_SCOPED_COLLECTIONS = [
  'clients',
  'products',
  'sales',
  'product_prices',
  'productCategories',
  'budgets',
];

async function deleteUserScopedData(uid: string) {
  for (const collectionName of USER_SCOPED_COLLECTIONS) {
    const q = query(collection(db, collectionName), where('userId', '==', uid));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  }

  await deleteDoc(doc(db, 'counters', uid)).catch(() => {});
  await deleteDoc(doc(db, 'users', uid)).catch(() => {});
}

async function deleteUserStorage(uid: string) {
  try {
    const folderRef = ref(storage, `logos/${uid}`);
    const list = await listAll(folderRef);
    await Promise.all(list.items.map((item) => deleteObject(item)));
  } catch {
    // sem logo ou pasta já vazia — segue normalmente
  }
}

// Apaga primeiro os dados (Firestore + Storage), só então a conta de autenticação —
// assim, se o passo final exigir reautenticação, nada fica "meio apagado" de forma irrecuperável.
export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário autenticado.');

  await deleteUserScopedData(user.uid);
  await deleteUserStorage(user.uid);
  await deleteUser(user);
}

export async function reauthenticateWithPassword(password: string) {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Nenhum usuário autenticado.');

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export async function reauthenticateWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário autenticado.');

  await reauthenticateWithPopup(user, new GoogleAuthProvider());
}

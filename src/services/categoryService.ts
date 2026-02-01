import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { serverTimestamp } from 'firebase/firestore';

const COLLECTION = 'productCategories';

export async function getCategoriesByUser(userId?: string): Promise<string[]> {
  if (!userId) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data().name as string);
}

export async function createCategory(userId: string, name: string) {
  await addDoc(collection(db, COLLECTION), {
    userId,
    name: name.trim(),
    createdAt: serverTimestamp(),
  });
}

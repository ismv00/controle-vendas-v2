import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { Insumo } from '../types/Insumo';

const COLLECTION = 'insumos';

export async function createInsumo(insumo: Omit<Insumo, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), insumo);
  return docRef.id;
}

export async function getInsumosByUser(userId: string): Promise<Insumo[]> {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));

  const snapshot = await getDocs(q);

  const insumos = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      name: data.name,
      unit: data.unit ?? '',
      cost: Number(data.cost ?? 0),
      stockQuantity: Number(data.stockQuantity ?? 0),
      userId: data.userId,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });

  return insumos.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
}

export async function updateInsumo(id: string, data: Partial<Omit<Insumo, 'id'>>) {
  const payload: Partial<Omit<Insumo, 'id'>> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.unit !== undefined) payload.unit = data.unit;
  if (data.cost !== undefined) payload.cost = data.cost;
  if (data.stockQuantity !== undefined) payload.stockQuantity = data.stockQuantity;

  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteInsumo(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { getNextSequenceNumber } from '../lib/sequence';
import { Budget } from '../types/Budget';

const COLLECTION = 'budgets';

export async function createBudget(
  budget: Omit<Budget, 'id' | 'createdAt' | 'controlNumber' | 'convertedSaleId'>
): Promise<string> {
  const controlNumber = await getNextSequenceNumber(budget.userId, 'nextBudgetNumber');

  const payload = {
    ...budget,
    controlNumber,
    convertedSaleId: null,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), payload);
  return docRef.id;
}

function mapBudget(id: string, data: Record<string, unknown>): Budget {
  const createdAt = data.createdAt as { toDate?: () => Date } | undefined;

  return {
    id,
    userId: data.userId as string,

    controlNumber: (data.controlNumber as number) ?? 0,

    clientId: (data.clientId as string | null) ?? null,
    clientName: (data.clientName as string) ?? '',
    clientPhone: (data.clientPhone as string) ?? '',

    items: (data.items as Budget['items']) ?? [],

    totalItems: (data.totalItems as number) ?? 0,
    totalValue: (data.totalValue as number) ?? 0,

    convertedSaleId: (data.convertedSaleId as string | null) ?? null,

    createdAt: createdAt?.toDate?.() ?? new Date(),
  };
}

export async function getBudgetsByUser(userId: string): Promise<Budget[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => mapBudget(docSnap.id, docSnap.data()));
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;

  return mapBudget(snap.id, snap.data());
}

export async function updateBudget(id: string, data: Partial<Budget>) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteBudget(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

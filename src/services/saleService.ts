import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { Sale } from '../types/Sale';

const COLLECTION = 'sales';

// CREATE
export async function createSale(sale: Omit<Sale, 'id' | 'createdAt'>) {
  const payload = {
    ...sale,
    createdAt: new Date(),
  };

  await addDoc(collection(db, COLLECTION), payload);
}

// GET BY USER
export async function getSalesByUser(userId: string): Promise<Sale[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    const items = (data.items ?? []).map((item: any) => {
      const baseCost =
        typeof item.baseCost === 'number'
          ? item.baseCost
          : typeof item.cost === 'number'
          ? item.cost
          : 0;

      return {
        ...item,
        baseCost,
      };
    });

    const totalCost =
      typeof data.totalCost === 'number'
        ? data.totalCost
        : items.reduce((sum: number, item: any) => sum + item.baseCost * (item.quantity ?? 1), 0);

    const totalValue = typeof data.totalValue === 'number' ? data.totalValue : 0;

    const totalProfit =
      typeof data.totalProfit === 'number' ? data.totalProfit : totalValue - totalCost;

    return {
      id: docSnap.id,
      userId: data.userId,

      clientId: data.clientId,
      clientName: data.clientName,

      items,

      totalItems: data.totalItems ?? items.length,
      totalValue,
      totalCost,
      totalProfit,

      status: data.status === 'pending' ? 'pending' : 'paid',

      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });
}

// UPDATE
export async function updateSale(id: string, data: Partial<Sale>) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date(),
  });
}

// DELETE
export async function deleteSale(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

// GET ALL
export async function getAllSales(userId: string): Promise<Sale[]> {
  return getSalesByUser(userId);
}

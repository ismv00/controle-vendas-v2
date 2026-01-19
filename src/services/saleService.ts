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
const MOCK_USER_ID = 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2';

// Criar a venda
export async function createSale(sale: Omit<Sale, 'id' | 'createdAt'>) {
  const payload = {
    ...sale,
    userId: MOCK_USER_ID,
    createdAt: new Date(),
  };

  await addDoc(collection(db, COLLECTION), payload);
}

// buscar as vendas do usuárip
export async function getSalesByUser(userId: string): Promise<Sale[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      userId: data.userId,

      clientId: data.clientId,
      clientName: data.clientName,

      items: data.items ?? [],

      totalItems: data.totalItems ?? 0,
      totalValue: data.totalValue ?? 0,
      totalCost: data.totalCost ?? 0,
      totalProfit: data.totalProfit ?? 0,

      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });
}

//Atualizar venda
export async function updateSale(id:string, data: Partial<Sale>) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date(),
  })
}

//Excluir Venda
export async function deleteSale(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getAllSales(userId: string): Promise<Sale[]> {
  return getSalesByUser(userId);
}

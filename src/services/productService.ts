import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { Product } from '@/src/types/Product';

const COLLECTION = 'products';

export async function createProduct(product: Omit<Product, 'id'>) {
  await addDoc(collection(db, COLLECTION), product);
}

export async function getProductsByUser(userId: string): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('userId', '==', userId));

  const snapshot = await getDocs(q);

  const products = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,

      name: data.name ?? data.nome,
      category: data.category ?? data.categoria,
      cost: Number(data.cost ?? data.custo ?? 0),

      userId: data.userId,
      createdAt: data.createdAt?.toDate?.() ?? data.migratedAt?.toDate?.() ?? new Date(),
    };
  });

  //  ORDENAÇÃO ALFABÉTICA AQUI
  return products.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
}
export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>) {
  const payload: Partial<Omit<Product, 'id'>> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.category !== undefined) payload.category = data.category;
  if (data.cost !== undefined) payload.cost = data.cost;

  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function getAllProducts(userId: string): Promise<Product[]> {
  return getProductsByUser(userId);
}

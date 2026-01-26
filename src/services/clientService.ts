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
  getDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { Client } from '../types/Client';

const COLLECTION = 'clients';

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>) {
  const payload = {
    name: client.name.toUpperCase(),
    fantasy: client.fantasy.toUpperCase(),
    address: client.address.toUpperCase(),
    phone: client.phone.toUpperCase(),

    userId: client.userId,
    createdAt: new Date(),
  };

  await addDoc(collection(db, COLLECTION), payload);
}

export async function getClientsByUser(userId: string): Promise<Client[]> {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('name'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      name: data.name,
      fantasy: data.fantasy,
      address: data.address,
      phone: data.phone,
      userId: data.userId,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });
}

export async function updateClient(id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) {
  const payload: Partial<Omit<Client, 'id' | 'createdAt'>> = {};

  if (data.name !== undefined) payload.name = data.name.toUpperCase();
  if (data.fantasy !== undefined) payload.fantasy = data.fantasy.toUpperCase();
  if (data.address !== undefined) payload.address = data.address.toUpperCase();
  if (data.phone !== undefined) payload.phone = data.phone.toUpperCase();

  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteClient(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getAllClients(userId: string): Promise<Client[]> {
  return getClientsByUser(userId);
}

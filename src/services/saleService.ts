import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { getNextSequenceNumber } from '../lib/sequence';
import { Sale, SaleItem, PaymentMethod } from '../types/Sale';

const COLLECTION = 'sales';
const VALID_PAYMENT_METHODS: PaymentMethod[] = ['dinheiro', 'pix', 'cartao', 'outro'];

// CREATE
export async function createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'receiptNumber'>): Promise<string> {
  const receiptNumber = await getNextSequenceNumber(sale.userId, 'nextSaleNumber');

  const payload = {
    ...sale,
    receiptNumber,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), payload);
  return docRef.id;
}

function mapSale(id: string, data: Record<string, unknown>): Sale {
  const rawItems = (data.items as Record<string, unknown>[]) ?? [];

  const items: SaleItem[] = rawItems.map((item) => {
    const baseCost =
      typeof item.baseCost === 'number'
        ? item.baseCost
        : typeof item.cost === 'number'
        ? item.cost
        : 0;

    return {
      ...item,
      baseCost,
    } as SaleItem;
  });

  const totalCost =
    typeof data.totalCost === 'number'
      ? data.totalCost
      : items.reduce((sum, item) => sum + item.baseCost * (item.quantity ?? 1), 0);

  const totalValue = typeof data.totalValue === 'number' ? data.totalValue : 0;

  const totalProfit =
    typeof data.totalProfit === 'number' ? data.totalProfit : totalValue - totalCost;

  const createdAt = data.createdAt as { toDate?: () => Date } | undefined;

  const paymentMethod = VALID_PAYMENT_METHODS.includes(data.paymentMethod as PaymentMethod)
    ? (data.paymentMethod as PaymentMethod)
    : undefined;

  return {
    id,
    userId: data.userId as string,

    clientId: data.clientId as string,
    clientName: data.clientName as string,

    items,

    totalItems: (data.totalItems as number) ?? items.length,
    totalValue,
    totalCost,
    totalProfit,

    status: data.status === 'pending' ? 'pending' : 'paid',
    receiptNumber: typeof data.receiptNumber === 'number' ? data.receiptNumber : undefined,
    paymentMethod,

    createdAt: createdAt?.toDate?.() ?? new Date(),
  };
}

// GET BY USER
export async function getSalesByUser(userId: string, options?: { limit?: number }): Promise<Sale[]> {
  const constraints = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    ...(options?.limit ? [fsLimit(options.limit)] : []),
  ];

  const q = query(collection(db, COLLECTION), ...constraints);

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => mapSale(docSnap.id, docSnap.data()));
}

// GET ONE
export async function getSaleById(id: string): Promise<Sale | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;

  return mapSale(snap.id, snap.data());
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

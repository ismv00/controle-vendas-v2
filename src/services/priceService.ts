import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { ProductPrice } from '../types/ProductPrice';

const COLLECTION = 'product_prices';

// CREATE
export async function createProductPrice(
  data: Omit<ProductPrice, 'id' | 'createdAt' | 'updatedAt'>
) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// UPDATE
export async function updateProductPrice(id: string, data: Partial<ProductPrice>) {
  const ref = doc(db, COLLECTION, id);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

//DELETE
export async function deleteProductPrice(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

//GET BY USER
export async function getProductPricesByUser(userId: string) {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,

      userId: data.userId,
      productId: data.productId,
      productName: data.productName,

      // compatibilidade com registros antigos
      baseCost:
        typeof data.baseCost === 'number'
          ? data.baseCost
          : typeof data.cost === 'number'
          ? data.cost
          : 0,

      operationalExpensePercent: data.operationalExpensePercent ?? 0,
      marginPercent: data.marginPercent ?? 0,
      salePrice: data.salePrice ?? 0,

      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.(),
    } as ProductPrice;
  });
}

// GET BY PRODUCT
export async function getProductPriceByProductId(userId: string, productId: string) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('productId', '==', productId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  return {
    id: docSnap.id,

    userId: data.userId,
    productId: data.productId,
    productName: data.productName,

    baseCost:
      typeof data.baseCost === 'number'
        ? data.baseCost
        : typeof data.cost === 'number'
        ? data.cost
        : 0,

    operationalExpensePercent: data.operationalExpensePercent ?? 0,
    marginPercent: data.marginPercent ?? 0,
    salePrice: data.salePrice ?? 0,

    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.(),
  } as ProductPrice;
}

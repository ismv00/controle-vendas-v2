import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { db, storage } from '@/src/lib/firebase';
import { Product, RecipeItem, StockMode } from '@/src/types/Product';

const COLLECTION = 'products';
const INSUMOS_COLLECTION = 'insumos';

// Produtos antigos usavam um campo booleano `trackStock` — docs sem `stockMode` ainda
// caem aqui, então continuam funcionando como "estoque direto" depois da migração.
function resolveStockMode(data: Record<string, unknown>): StockMode {
  if (data.stockMode === 'recipe') return 'recipe';
  if (data.stockMode === 'direct' || data.trackStock) return 'direct';
  return 'none';
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), product);
  return docRef.id;
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
      imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
      stockMode: resolveStockMode(data),
      stockQuantity: Number(data.stockQuantity ?? 0),
      recipeItems: Array.isArray(data.recipeItems) ? (data.recipeItems as RecipeItem[]) : [],

      userId: data.userId,
      createdAt: data.createdAt?.toDate?.() ?? data.migratedAt?.toDate?.() ?? new Date(),
    };
  });

  // ✅ ORDENAÇÃO ALFABÉTICA AQUI
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
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
  if (data.stockMode !== undefined) payload.stockMode = data.stockMode;
  if (data.stockQuantity !== undefined) payload.stockQuantity = data.stockQuantity;
  if (data.recipeItems !== undefined) payload.recipeItems = data.recipeItems;

  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function getAllProducts(userId: string): Promise<Product[]> {
  return getProductsByUser(userId);
}

// Ajusta o estoque de um produto (delta positivo repõe, negativo consome).
// Em modo "direto" desconta do próprio produto; em modo "receita" (ficha técnica)
// desconta de cada insumo, proporcional à quantidade consumida por unidade; em
// modo "none" não faz nada.
export async function adjustStock(productId: string, delta: number) {
  const ref = doc(db, COLLECTION, productId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();
  const stockMode = resolveStockMode(data);

  if (stockMode === 'direct') {
    await updateDoc(ref, { stockQuantity: increment(delta) });
    return;
  }

  if (stockMode === 'recipe') {
    const recipeItems = Array.isArray(data.recipeItems) ? (data.recipeItems as RecipeItem[]) : [];

    await Promise.all(
      recipeItems
        .filter((item) => item?.insumoId)
        .map((item) =>
          updateDoc(doc(db, INSUMOS_COLLECTION, item.insumoId), {
            stockQuantity: increment(delta * item.quantity),
          }).catch(() => {})
        )
    );
  }
}

export async function adjustStockForItems(
  items: { productId: string; quantity: number }[],
  sign: 1 | -1
) {
  await Promise.all(items.map((item) => adjustStock(item.productId, sign * item.quantity)));
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadProductImage(
  userId: string,
  productId: string,
  file: File
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo precisa ser uma imagem.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('A imagem precisa ter até 5MB.');
  }

  const extension = file.name.split('.').pop() || 'png';
  const imageRef = ref(storage, `product-images/${userId}/${productId}.${extension}`);

  await uploadBytes(imageRef, file);
  const imageUrl = await getDownloadURL(imageRef);

  await updateDoc(doc(db, COLLECTION, productId), { imageUrl });

  return imageUrl;
}

export async function removeProductImage(productId: string, imageUrl: string) {
  try {
    await deleteObject(ref(storage, imageUrl));
  } catch {
    // segue mesmo se o arquivo já não existir no Storage
  }

  await updateDoc(doc(db, COLLECTION, productId), { imageUrl: '' });
}

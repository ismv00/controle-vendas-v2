import { addDoc, collection, deleteDoc, doc, getDocs, query, where, updateDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../lib/firebase";
import { ProductPrice } from "../types/ProductPrice";

const COLLECTION = 'product_prices';

// CREATE
export async function createProductPrice(data:Omit<ProductPrice, 'id' | 'createdAt' | 'updatedAt'>
) {
    const docRef = await addDoc(collection(db, COLLECTION) , {
        ...data,
        createdAt: serverTimestamp(),
    });

    return docRef.id
}

// UPDATE
export async function updateProductPrice(
    id: string,
    data: Partial<ProductPrice>
) {
    const ref = doc(db, COLLECTION, id);

    await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp()
    })
}

//DELETE
export async function deleteProductPrice(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
}

//GET BY USER
export async function getProductPricesByUser(userId: string) {
    const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId        )
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as ProductPrice[];
}

// GET BY PRODUCT
export async function getProductPriceByProductId(
    userId: string,
    productId: string
) {
    const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId),
        where('productId', '==', productId)
    );

    const snapshot = await getDocs(q);

    if(snapshot.empty) return null;

    const docSnap = snapshot.docs[0];

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
    } as ProductPrice;
}

import { addDoc, collection, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PriceList } from "../types/PriceList";

const COLLECTION = 'priceList';

export async function createPriceList(
    userId: string,
    name: string
) {
    const docRef = await addDoc(collection(db, COLLECTION), {
        userId,
        name,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function getPriceListsByUser(
    userId: string
): Promise<PriceList[]> {
    const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PriceList, 'id'>),
    }));
}

import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

const COUNTERS_COLLECTION = 'counters';

// Contador sequencial por usuário (ex.: número de orçamento, número de venda),
// guardado em counters/{userId}, um campo por sequência.
export async function getNextSequenceNumber(userId: string, field: string): Promise<number> {
  const counterRef = doc(db, COUNTERS_COLLECTION, userId);

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    const next = (snap.data()?.[field] ?? 1) as number;

    transaction.set(counterRef, { [field]: next + 1 }, { merge: true });

    return next;
  });
}

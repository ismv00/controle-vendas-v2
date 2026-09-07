import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION = 'users';

export type UserProfile = {
  companyName: string;
};

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile) => void
) {
  return onSnapshot(doc(db, COLLECTION, uid), (snap) => {
    const data = snap.data();
    callback({ companyName: data?.companyName ?? '' });
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, COLLECTION, uid), data, { merge: true });
}

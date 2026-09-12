import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const COLLECTION = 'users';

export type UserProfile = {
  companyName: string;
  logoUrl: string;
  monthlyGoal: number;
  pixKey: string;
};

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile) => void
) {
  return onSnapshot(doc(db, COLLECTION, uid), (snap) => {
    const data = snap.data();
    callback({
      companyName: data?.companyName ?? '',
      logoUrl: data?.logoUrl ?? '',
      monthlyGoal: typeof data?.monthlyGoal === 'number' ? data.monthlyGoal : 0,
      pixKey: data?.pixKey ?? '',
    });
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, COLLECTION, uid), data, { merge: true });
}

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadCompanyLogo(uid: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo precisa ser uma imagem.');
  }

  if (file.size > MAX_LOGO_SIZE) {
    throw new Error('A imagem precisa ter até 2MB.');
  }

  const extension = file.name.split('.').pop() || 'png';
  const logoRef = ref(storage, `logos/${uid}/logo.${extension}`);

  await uploadBytes(logoRef, file);
  const logoUrl = await getDownloadURL(logoRef);

  await updateUserProfile(uid, { logoUrl });

  return logoUrl;
}

export async function removeCompanyLogo(uid: string, logoUrl: string) {
  try {
    await deleteObject(ref(storage, logoUrl));
  } catch {
    // segue mesmo se o arquivo já não existir no Storage
  }

  await updateUserProfile(uid, { logoUrl: '' });
}

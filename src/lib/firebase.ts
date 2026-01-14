import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBJJKW0DpvYsnCQ6OTIw6Oz0itzLsaoKLU',
  authDomain: 'controle-vendas-bcdee.firebaseapp.com',
  projectId: 'controle-vendas-bcdee',
  storageBucket: 'controle-vendas-bcdee.firebasestorage.app',
  messagingSenderId: '291728491556',
  appId: '1:291728491556:web:01529ab76189634ed9c4b1',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

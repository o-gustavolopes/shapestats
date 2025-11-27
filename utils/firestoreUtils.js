import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  where
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

export async function getCollectionOrdered(col) {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    const ref = collection(db, col);

    const q = query(
      ref,
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.log("Erro ao buscar coleção ordenada:", e);
    return [];
  }
}

export async function getUserCollectionOrdered(col, uid) {
  try {
    const ref = collection(db, col);

    const q = query(
      ref,
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.log("Erro ao buscar dados:", e);
    return [];
  }
}

export async function getSingleDoc(col, id) {
  try {
    const ref = doc(db, col, id);
    const snap = await getDoc(ref);

    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.log("Erro ao buscar documento único:", e);
    return null;
  }
}

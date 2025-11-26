import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../firebaseConfig";

/**
 * Obtém a coleção ordenada SEMPRE pelo campo createdAt (mais recente primeiro)
 */
export async function getCollectionOrdered(col) {
  try {
    const ref = collection(db, col);

    // ordena SEMPRE pelo timestamp correto
    const q = query(ref, orderBy("createdAt", "desc"));

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));

  } catch (e) {
    console.log("Erro ao buscar coleção ordenada:", e);
    return [];
  }
}

export async function getSingleDoc(col, id) {
  try {
    const ref = doc(db, col, id);
    const snap = await getDoc(ref);

    return snap.exists() ? { id: snap.id, ...snap.data() } : null;

  } catch (e) {
    console.log("Erro ao buscar document único:", e);
    return null;
  }
}

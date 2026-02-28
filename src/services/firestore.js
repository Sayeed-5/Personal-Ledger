/**
 * Firestore Data Service
 * All functions are user-scoped: users/{uid}/people, users/{uid}/transactions
 * Uses onSnapshot for real-time subscriptions.
 */
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';

// ─── Collection references ───────────────────────────────────────────

function peopleCol(uid) {
  return collection(db, 'users', uid, 'people');
}

function transactionsCol(uid) {
  return collection(db, 'users', uid, 'transactions');
}

// ─── People CRUD ─────────────────────────────────────────────────────

/**
 * Add a new person under the user's scope
 */
export async function addPerson(uid, name) {
  const ref = await addDoc(peopleCol(uid), {
    name,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update a person's name
 */
export async function updatePerson(uid, personId, name) {
  const personRef = doc(db, 'users', uid, 'people', personId);
  await updateDoc(personRef, { name });
}

/**
 * Delete a person and all their transactions (batch delete)
 */
export async function deletePerson(uid, personId) {
  // Delete all transactions for this person
  const txQuery = query(
    transactionsCol(uid),
    where('personId', '==', personId)
  );
  const snapshot = await getDocs(txQuery);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));

  // Delete the person document
  const personRef = doc(db, 'users', uid, 'people', personId);
  batch.delete(personRef);

  await batch.commit();
}

// ─── Transaction CRUD ────────────────────────────────────────────────

/**
 * Add a new transaction
 * @param {string} uid
 * @param {{ personId, amount, date, type, note }} data
 */
export async function addTransaction(uid, data) {
  const ref = await addDoc(transactionsCol(uid), {
    personId: data.personId,
    amount: data.amount,
    date: data.date,
    type: data.type,       // 'GIVEN' | 'RECEIVED'
    note: data.note || '',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(uid, transactionId, updates) {
  const txRef = doc(db, 'users', uid, 'transactions', transactionId);
  await updateDoc(txRef, updates);
}

/**
 * Delete a single transaction
 */
export async function deleteTransaction(uid, transactionId) {
  const txRef = doc(db, 'users', uid, 'transactions', transactionId);
  await deleteDoc(txRef);
}

// ─── Real-time Subscriptions ─────────────────────────────────────────

/**
 * Subscribe to the people list (real-time)
 * @returns unsubscribe function
 */
export function subscribeToPeople(uid, callback) {
  const q = query(peopleCol(uid), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const people = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(people);
  });
}

/**
 * Subscribe to all transactions for the user (real-time)
 * @returns unsubscribe function
 */
export function subscribeToTransactions(uid, callback) {
  const q = query(transactionsCol(uid));
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(transactions);
  });
}

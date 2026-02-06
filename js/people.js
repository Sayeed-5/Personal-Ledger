import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  peopleCol,
  query,
  db,
  updateDoc,
  writeBatch,
  where,
  transCol,
} from "./firebase.js";

(() => {
  const App = (window.App = window.App || {});
  App.People = App.People || {};

  const MAX_PEOPLE = 50;
  let peopleCache = [];
  let unsubscribe = null;
  const listeners = new Set();

  function normalizeName(name) {
    return String(name || "").trim();
  }

  function normalizeNameKey(name) {
    return normalizeName(name).toLocaleLowerCase();
  }

  function notify() {
    listeners.forEach((fn) => fn(peopleCache));
  }

  function startListener() {
    if (unsubscribe) return;
    unsubscribe = onSnapshot(peopleCol, (snapshot) => {
      peopleCache = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      notify();
    });
  }

  function listPeople() {
    return Array.isArray(peopleCache) ? peopleCache : [];
  }

  function formatError(err, fallback) {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  async function addPerson(name) {
    const clean = normalizeName(name);
    if (!clean) return { ok: false, error: "Name cannot be empty." };

    const people = listPeople();
    if (people.length >= MAX_PEOPLE) return { ok: false, error: "Maximum 50 people reached." };

    const key = normalizeNameKey(clean);
    const exists = people.some((p) => normalizeNameKey(p.name) === key);
    if (exists) return { ok: false, error: "That person already exists." };

    try {
      const docRef = await addDoc(peopleCol, { name: clean, createdAt: Date.now() });
      return { ok: true, person: { id: docRef.id, name: clean, createdAt: Date.now() } };
    } catch (err) {
      return { ok: false, error: formatError(err, "Unable to add person. Check Firestore access.") };
    }
  }

  async function updatePerson(id, name) {
    const clean = normalizeName(name);
    if (!clean) return { ok: false, error: "Name cannot be empty." };

    const people = listPeople();
    const index = people.findIndex((p) => p.id === id);
    if (index === -1) return { ok: false, error: "Person not found." };

    const key = normalizeNameKey(clean);
    const exists = people.some((p) => p.id !== id && normalizeNameKey(p.name) === key);
    if (exists) return { ok: false, error: "Another person already has that name." };

    try {
      await updateDoc(doc(peopleCol, id), { name: clean, updatedAt: Date.now() });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: formatError(err, "Unable to update person. Check Firestore access.") };
    }
  }

  async function deletePerson(id) {
    const people = listPeople();
    const remaining = people.filter((p) => p.id !== id);
    if (remaining.length === people.length) return { ok: false, error: "Person not found." };

    try {
      await deleteDoc(doc(peopleCol, id));

      const txQuery = query(transCol, where("personId", "==", id));
      const snapshot = await getDocs(txQuery);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (err) {
      return { ok: false, error: formatError(err, "Unable to delete person. Check Firestore access.") };
    }

    const activeId = getActivePersonId();
    if (activeId === id) {
      if (remaining[0]) {
        App.Data.writeActivePersonId(remaining[0].id);
      } else {
        App.Data.clearActivePersonId();
      }
    }

    return { ok: true };
  }

  function getPersonById(id) {
    if (!id) return null;
    return listPeople().find((p) => p.id === id) || null;
  }

  function getActivePersonId() {
    const id = App.Data.readActivePersonId();
    return typeof id === "string" ? id : "";
  }

  function setActivePersonId(id) {
    const exists = !!getPersonById(id);
    if (!exists) {
      App.Data.clearActivePersonId();
      return { ok: false, error: "Person not found." };
    }
    App.Data.writeActivePersonId(id);
    return { ok: true };
  }

  function getActivePerson() {
    return getPersonById(getActivePersonId());
  }

  function subscribe(callback) {
    listeners.add(callback);
    callback(peopleCache);
    return () => listeners.delete(callback);
  }

  App.People.MAX_PEOPLE = MAX_PEOPLE;
  App.People.listPeople = listPeople;
  App.People.addPerson = addPerson;
  App.People.updatePerson = updatePerson;
  App.People.deletePerson = deletePerson;
  App.People.getPersonById = getPersonById;
  App.People.getActivePersonId = getActivePersonId;
  App.People.setActivePersonId = setActivePersonId;
  App.People.getActivePerson = getActivePerson;
  App.People.subscribe = subscribe;
  App.People.startListener = startListener;

  startListener();
})();

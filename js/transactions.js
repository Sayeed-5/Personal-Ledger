import { addDoc, onSnapshot, transCol } from "./firebase.js";

(() => {
  const App = (window.App = window.App || {});
  App.Transactions = App.Transactions || {};

  const TYPES = Object.freeze({
    GIVEN: "GIVEN",
    RECEIVED: "RECEIVED",
  });

  let transactionsCache = [];
  let unsubscribe = null;
  const listeners = new Set();

  function parseDDMMYYYYToISO(s) {
    if (typeof s !== "string") return null;
    const trimmed = s.trim();
    if (!/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return null;
    const [dayStr, monthStr, yearStr] = trimmed.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr);
    const d = Number(dayStr);
    const iso = `${yearStr}-${monthStr}-${dayStr}`;
    const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
    if (Number.isNaN(date.getTime())) return null;
    if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) {
      return null;
    }
    return iso;
  }

  function formatDateForDisplay(iso) {
    if (typeof iso !== "string") return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  }

  function parsePositiveAmount(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (n <= 0) return null;
    return Math.round(n * 100) / 100;
  }

  function notify() {
    listeners.forEach((fn) => fn(transactionsCache));
  }

  function startListener() {
    if (unsubscribe) return;
    unsubscribe = onSnapshot(transCol, (snapshot) => {
      transactionsCache = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      notify();
    });
  }

  function listAll() {
    return Array.isArray(transactionsCache) ? transactionsCache : [];
  }

  function listByPersonId(personId) {
    return listAll().filter((t) => t.personId === personId);
  }

  async function addTransaction({ personId, amount, date, type, note }) {
    if (!personId) return { ok: false, error: "No person selected." };

    const person = App.People.getPersonById(personId);
    if (!person) return { ok: false, error: "Selected person not found." };

    const amt = parsePositiveAmount(amount);
    if (amt === null) return { ok: false, error: "Amount must be a number greater than 0." };

    const isoDate = parseDDMMYYYYToISO(date);
    if (!isoDate) return { ok: false, error: "Date must be in DD-MM-YYYY format." };

    if (type !== TYPES.GIVEN && type !== TYPES.RECEIVED) return { ok: false, error: "Invalid transaction type." };

    const cleanNote = String(note || "").trim();

    const txn = {
      personId,
      amount: amt,
      date: isoDate,
      type,
      note: cleanNote,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(transCol, txn);
    return { ok: true, transaction: { ...txn, id: docRef.id } };
  }

  function sortForDisplay(txns) {
    // Date desc, then createdAt desc (stable display)
    return [...txns].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  function renderTransactionList(containerEl, txns, formatCurrency) {
    containerEl.textContent = "";
    const items = sortForDisplay(txns);

    for (const t of items) {
      const row = document.createElement("div");
      row.className = "table-row";
      row.setAttribute("role", "row");

      const cDate = document.createElement("div");
      cDate.textContent = formatDateForDisplay(t.date);

      const cType = document.createElement("div");
      const badge = document.createElement("span");
      badge.className = `badge ${t.type === TYPES.GIVEN ? "given" : "received"}`;
      badge.textContent = t.type;
      cType.appendChild(badge);

      const cAmount = document.createElement("div");
      cAmount.className = "right";
      cAmount.textContent = formatCurrency(t.amount);

      const cNote = document.createElement("div");
      cNote.textContent = t.note || "—";
      cNote.title = t.note || "";

      row.appendChild(cDate);
      row.appendChild(cType);
      row.appendChild(cAmount);
      row.appendChild(cNote);

      containerEl.appendChild(row);
    }
  }

  App.Transactions.TYPES = TYPES;
  App.Transactions.listAll = listAll;
  App.Transactions.listByPersonId = listByPersonId;
  App.Transactions.addTransaction = addTransaction;
  App.Transactions.renderTransactionList = renderTransactionList;
  App.Transactions.subscribe = (callback) => {
    listeners.add(callback);
    callback(transactionsCache);
    return () => listeners.delete(callback);
  };
  App.Transactions.startListener = startListener;

  startListener();
})();

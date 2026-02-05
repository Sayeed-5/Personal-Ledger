(() => {
  const App = (window.App = window.App || {});
  App.Ledger = App.Ledger || {};

  function sumByType(txns, type) {
    return txns.reduce((acc, t) => (t.type === type ? acc + Number(t.amount || 0) : acc), 0);
  }

  function calculateBalanceForPerson(personId) {
    const txns = App.Transactions.listByPersonId(personId);
    const given = sumByType(txns, App.Transactions.TYPES.GIVEN);
    const received = sumByType(txns, App.Transactions.TYPES.RECEIVED);
    return Math.round((given - received) * 100) / 100;
  }

  function getStatusForBalance(balance) {
    if (balance > 0) return "You will receive";
    if (balance < 0) return "You need to pay";
    return "Settled";
  }

  function formatCurrency(amount) {
    const n = Number(amount || 0);
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `- ${formatted}` : formatted;
  }

  function todayDDMMYYYY() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}-${m}-${y}`;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
  }

  function setHidden(id, hidden) {
    const node = el(id);
    if (node) node.hidden = !!hidden;
  }

  function clearError(id) {
    setText(id, "");
  }

  function setError(id, msg) {
    setText(id, msg || "");
  }

  function renderPeopleList() {
    const list = el("peopleList");
    list.textContent = "";

    const people = App.People.listPeople().slice().sort((a, b) => a.name.localeCompare(b.name));
    const activeId = App.People.getActivePersonId();

    setHidden("peopleEmpty", people.length !== 0);
    setText("peopleMeta", `${people.length}/${App.People.MAX_PEOPLE} people`);

    for (const p of people) {
      const li = document.createElement("li");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "person-btn";
      btn.textContent = p.name;
      btn.setAttribute("aria-current", p.id === activeId ? "true" : "false");

      btn.addEventListener("click", () => {
        const res = App.People.setActivePersonId(p.id);
        if (!res.ok) return;
        renderAll();
      });

      const meta = document.createElement("div");
      meta.className = "person-meta";

      const bal = calculateBalanceForPerson(p.id);
      const status = getStatusForBalance(bal);

      const metaLeft = document.createElement("span");
      metaLeft.textContent = `Balance: ${formatCurrency(bal)}`;

      const metaRight = document.createElement("span");
      metaRight.textContent = status;

      meta.appendChild(metaLeft);
      meta.appendChild(metaRight);

      li.appendChild(btn);
      li.appendChild(meta);
      list.appendChild(li);
    }
  }

  function renderLedgerHeader(person) {
    if (!person) {
      setText("activePersonTitle", "Ledger");
      setText("activePersonSubtitle", "Select a person to view their ledger.");
      setText("balanceValue", "—");
      setText("statusValue", "—");
      return;
    }

    setText("activePersonTitle", person.name);
    setText("activePersonSubtitle", "GIVEN adds to balance. RECEIVED subtracts from balance.");

    const bal = calculateBalanceForPerson(person.id);
    setText("balanceValue", formatCurrency(bal));
    setText("statusValue", getStatusForBalance(bal));
  }

  function renderTransactions(person) {
    const txList = el("txList");
    const txMeta = el("txMeta");

    if (!person) {
      txList.textContent = "";
      txMeta.textContent = "";
      setHidden("txEmpty", true);
      return;
    }

    const txns = App.Transactions.listByPersonId(person.id);
    txMeta.textContent = `${txns.length} transaction${txns.length === 1 ? "" : "s"}`;

    setHidden("txEmpty", txns.length !== 0);
    App.Transactions.renderTransactionList(txList, txns, formatCurrency);
  }

  function setTransactionFormEnabled(enabled) {
    const form = el("txForm");
    const submit = el("txSubmit");
    const inputs = form.querySelectorAll("input, select, button");
    inputs.forEach((n) => (n.disabled = !enabled));
    submit.disabled = !enabled;
  }

  function renderAll() {
    const person = App.People.getActivePerson();
    renderPeopleList();
    renderLedgerHeader(person);
    renderTransactions(person);
    setTransactionFormEnabled(!!person);
  }

  function wirePeopleForm() {
    const form = el("personForm");
    const input = el("personName");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError("personError");

      const res = App.People.addPerson(input.value);
      if (!res.ok) {
        setError("personError", res.error);
        return;
      }

      input.value = "";
      App.People.setActivePersonId(res.person.id);
      renderAll();
    });
  }

  function wireTransactionForm() {
    const form = el("txForm");
    const typeEl = el("txType");
    const amountEl = el("txAmount");
    const dateEl = el("txDate");
    const noteEl = el("txNote");

    dateEl.value = todayDDMMYYYY();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError("txError");

      const personId = App.People.getActivePersonId();
      if (!personId) {
        setError("txError", "Select a person first.");
        return;
      }

      const res = App.Transactions.addTransaction({
        personId,
        type: typeEl.value,
        amount: amountEl.value,
        date: dateEl.value,
        note: noteEl.value,
      });

      if (!res.ok) {
        setError("txError", res.error);
        return;
      }

      amountEl.value = "";
      noteEl.value = "";
      renderAll();
    });
  }

  function ensureActivePersonStillValid() {
    const id = App.People.getActivePersonId();
    if (!id) return;
    const exists = !!App.People.getPersonById(id);
    if (!exists) App.Data.clearActivePersonId();
  }

  function bootstrap() {
    ensureActivePersonStillValid();
    wirePeopleForm();
    wireTransactionForm();
    renderAll();
  }

  App.Ledger.calculateBalanceForPerson = calculateBalanceForPerson;
  App.Ledger.getStatusForBalance = getStatusForBalance;

  document.addEventListener("DOMContentLoaded", bootstrap);
})();

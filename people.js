(() => {
  const App = (window.App = window.App || {});
  App.People = App.People || {};

  const MAX_PEOPLE = 50;

  function normalizeName(name) {
    return String(name || "").trim();
  }

  function normalizeNameKey(name) {
    return normalizeName(name).toLocaleLowerCase();
  }

  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    // Fallback: sufficiently unique for local usage
    return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function listPeople() {
    const people = App.Data.readPeople();
    return Array.isArray(people) ? people : [];
  }

  function writePeople(people) {
    App.Data.writePeople(people);
  }

  function addPerson(name) {
    const clean = normalizeName(name);
    if (!clean) return { ok: false, error: "Name cannot be empty." };

    const people = listPeople();
    if (people.length >= MAX_PEOPLE) return { ok: false, error: "Maximum 50 people reached." };

    const key = normalizeNameKey(clean);
    const exists = people.some((p) => normalizeNameKey(p.name) === key);
    if (exists) return { ok: false, error: "That person already exists." };

    const person = { id: newId(), name: clean, createdAt: Date.now() };
    writePeople([...people, person]);
    return { ok: true, person };
  }

  function updatePerson(id, name) {
    const clean = normalizeName(name);
    if (!clean) return { ok: false, error: "Name cannot be empty." };

    const people = listPeople();
    const index = people.findIndex((p) => p.id === id);
    if (index === -1) return { ok: false, error: "Person not found." };

    const key = normalizeNameKey(clean);
    const exists = people.some((p) => p.id !== id && normalizeNameKey(p.name) === key);
    if (exists) return { ok: false, error: "Another person already has that name." };

    const updated = { ...people[index], name: clean, updatedAt: Date.now() };
    const next = [...people];
    next[index] = updated;
    writePeople(next);

    return { ok: true, person: updated };
  }

  function deletePerson(id) {
    const people = listPeople();
    const remaining = people.filter((p) => p.id !== id);
    if (remaining.length === people.length) return { ok: false, error: "Person not found." };

    writePeople(remaining);

    if (App.Transactions && typeof App.Transactions.deleteByPersonId === "function") {
      App.Transactions.deleteByPersonId(id);
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

  App.People.MAX_PEOPLE = MAX_PEOPLE;
  App.People.listPeople = listPeople;
  App.People.addPerson = addPerson;
  App.People.updatePerson = updatePerson;
  App.People.deletePerson = deletePerson;
  App.People.getPersonById = getPersonById;
  App.People.getActivePersonId = getActivePersonId;
  App.People.setActivePersonId = setActivePersonId;
  App.People.getActivePerson = getActivePerson;
})();

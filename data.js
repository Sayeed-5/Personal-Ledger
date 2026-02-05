(() => {
  const App = (window.App = window.App || {});
  App.Data = App.Data || {};

  const KEYS = Object.freeze({
    PEOPLE: "pml_people_v1",
    TXNS: "pml_txns_v1",
    ACTIVE_PERSON_ID: "pml_active_person_id_v1",
  });

  function safeParse(json, fallback) {
    try {
      const v = JSON.parse(json);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function read(key, fallback) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return safeParse(raw, fallback);
  }

  function write(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    window.localStorage.removeItem(key);
  }

  App.Data.KEYS = KEYS;

  App.Data.readPeople = () => read(KEYS.PEOPLE, []);
  App.Data.writePeople = (people) => write(KEYS.PEOPLE, people);

  App.Data.readTransactions = () => read(KEYS.TXNS, []);
  App.Data.writeTransactions = (txns) => write(KEYS.TXNS, txns);

  App.Data.readActivePersonId = () => read(KEYS.ACTIVE_PERSON_ID, "");
  App.Data.writeActivePersonId = (id) => write(KEYS.ACTIVE_PERSON_ID, id);
  App.Data.clearActivePersonId = () => remove(KEYS.ACTIVE_PERSON_ID);
})();

(() => {
  const App = (window.App = window.App || {});
  App.Data = App.Data || {};

  let activePersonId = "";

  App.Data.readActivePersonId = () => activePersonId;
  App.Data.writeActivePersonId = (id) => {
    activePersonId = typeof id === "string" ? id : "";
  };
  App.Data.clearActivePersonId = () => {
    activePersonId = "";
  };
})();

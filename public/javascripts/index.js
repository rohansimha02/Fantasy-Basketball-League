async function init() {
  await loadIdentity();


  document.getElementById("create-team-btn").onclick = function () {
    window.location.href = "create-team.html";
  };
  document.getElementById("add-player-btn").onclick = function () {
    window.location.href = "add-player.html";
  };
  document.getElementById("drop-player-btn").onclick = function () {
    window.location.href = "drop-player.html";
  };

  document.getElementById("league-btn").onclick = function () {
    window.location.href = "leagues.html";
  };
}

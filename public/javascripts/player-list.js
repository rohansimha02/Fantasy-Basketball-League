let allPlayers = [];
let selectedPlayers = [];

async function initCreateTeam() {
  await loadPlayerList();
  setupSearchableDropdown();

  document.getElementById("create-team-form").onsubmit = async function (e) {
    e.preventDefault();
    const teamName = document.getElementById("teamName").value.trim();
    const members = selectedPlayers;

    if (members.length === 0) {
      document.getElementById("create-team-message").innerHTML =
        '<div class="alert alert-danger">Please select at least one player.</div>';
      return;
    }

    const leagueId = localStorage.getItem("selectedLeagueId");
    console.log("leagueId:", leagueId);

    const res = await fetch("/api/team/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, members, leagueId }),
    });
    const msgDiv = document.getElementById("create-team-message");
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        msgDiv.innerHTML = `
                        <div class="alert alert-success">
                            <h4>Team Created Successfully!</h4>
                            <div><strong>${data.team.teamName}</strong></div>
                            <ul>
                                ${data.team.members
                                  .map((member) => `<li>${member}</li>`)
                                  .join("")}
                            </ul>
                        </div>
                    `;
        // Redirect to homepage after a short delay
        setTimeout(() => {
            window.location.href = '/homepage.html';
        }, 2000); // Redirect after 2 seconds

      } else {
         msgDiv.innerHTML = `<div class="alert alert-danger">${
        data.message || "Failed to create team."
      }</div>`;
      }
    } else {
      const err = await res.json();
      msgDiv.innerHTML = `<div class="alert alert-danger">${
        err.message || "Failed to create team."
      }</div>`;
    }
  };
}

async function loadPlayerList() {
  try {
    const res = await fetch("/api/team/player-names");
    allPlayers = await res.json();
  } catch (error) {
    console.error("Failed to load players:", error);
    allPlayers = [];
  }
}

async function setupSearchableDropdown() {
  const searchInput = document.getElementById("player-search");
  const dropdown = document.getElementById("player-dropdown");
  const leagueId = localStorage.getItem("selectedLeagueId");

  try {
    const res = await fetch("/api/team/all-teams");
    const data = await res.json();
    const teamsInLeague = data.teams.filter(team => team.league === leagueId);
    const playersInLeague = teamsInLeague.flatMap(team => team.members);

    searchInput.addEventListener("input", function (e) {
      const query = e.target.value.trim().toLowerCase();

      if (query.length === 0) {
        hideDropdown();
        return;
      }

      const filteredPlayers = allPlayers.filter(
        (player) => player.toLowerCase().includes(query)
      );

      showDropdownWithAvailability(filteredPlayers, playersInLeague);
    });
  } catch (error) {
    console.error("Error loading teams:", error);
  }

  searchInput.addEventListener("focus", function (e) {
    const query = e.target.value.trim().toLowerCase();
    if (query.length > 0) {
      const filteredPlayers = allPlayers.filter(
        (player) =>
          player.toLowerCase().includes(query) &&
          !selectedPlayers.includes(player)
      );
      showDropdown(filteredPlayers);
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".player-search-container")) {
      hideDropdown();
    }
  });
}

function showDropdown(players) {
  const dropdown = document.getElementById("player-dropdown");

  if (selectedPlayers.length >= 10) {
    dropdown.innerHTML = '<div class="no-results">Team is full (10 players maximum)</div>';
  } else if (players.length === 0) {
    dropdown.innerHTML = '<div class="no-results">No players found</div>';
  } else {
    dropdown.innerHTML = players
      .slice(0, 10)
      .map((player) => {
        const isOnTeam = selectedPlayers.includes(player);
        const className = isOnTeam ? "player-dropdown-item disabled" : "player-dropdown-item";
        const style = isOnTeam ? "opacity: 0.6;" : "";
        const suffix = isOnTeam ? " (Already selected)" : "";
        return `<div class="${className}" style="${style}" ${!isOnTeam ? `onclick="selectPlayer('${player.replace(/'/g, "\\'")}')"` : ""}>${player}${suffix}</div>`;
      })
      .join("");
  }

  dropdown.style.display = "block";
}

function showDropdownWithAvailability(players, playersInLeague) {
  const dropdown = document.getElementById("player-dropdown");

  if (players.length === 0) {
    dropdown.innerHTML = '<div class="no-results">No players found</div>';
  } else {
    dropdown.innerHTML = players
      .slice(0, 10)
      .map((player) => {
        const isInLeague = playersInLeague.includes(player);
        const isSelected = selectedPlayers.includes(player);
        const className = "player-dropdown-item" + ((isInLeague || isSelected) ? " disabled" : "");
        const style = (isInLeague || isSelected) ? "opacity: 0.6;" : "";
        let suffix = "";
        if (isSelected) suffix = " (Already selected)";
        else if (isInLeague) suffix = " (Already in this league)";
        
        return `<div class="${className}" style="${style}" ${
          !isInLeague && !isSelected ? 
          `onclick="selectPlayer('${player.replace(/'/g, "\\'")}')"` : 
          ""
        }>${player}${suffix}</div>`;
      })
      .join("");
  }

  dropdown.style.display = "block";
}

function hideDropdown() {
  document.getElementById("player-dropdown").style.display = "none";
}

function selectPlayer(playerName) {
  if (!selectedPlayers.includes(playerName) && selectedPlayers.length < 10) {
    selectedPlayers.push(playerName);
    updateSelectedPlayersDisplay();
    document.getElementById("player-search").value = "";
    hideDropdown();
  } else if (selectedPlayers.length >= 10) {
    const msgDiv = document.getElementById("create-team-message");
    msgDiv.innerHTML = '<div class="alert alert-warning">Maximum 10 players allowed per team.</div>';
    setTimeout(() => msgDiv.innerHTML = '', 3000);
  }
}

function removePlayer(playerName) {
  selectedPlayers = selectedPlayers.filter((p) => p !== playerName);
  updateSelectedPlayersDisplay();
}

function updateSelectedPlayersDisplay() {
  const container = document.getElementById("selected-players");
  const membersInput = document.getElementById("members");

  if (selectedPlayers.length === 0) {
    container.innerHTML =
      '<small class="form-text text-light">Selected players will appear here. You need at least one player to create a team.</small>';
    membersInput.value = "";
  } else {
    container.innerHTML = `
      <div class="selected-players-header">
        <span>Selected Players (${selectedPlayers.length}/10)</span>
      </div>
      ${selectedPlayers
        .map(
          (player) =>
            `<span class="selected-player-tag">
              ${player}
              <span class="remove-player" onclick="removePlayer('${player.replace(
                /'/g,
                "\\'"
              )}')">&times;</span>
            </span>`
        )
        .join("")}`;
    membersInput.value = JSON.stringify(selectedPlayers);
  }
}

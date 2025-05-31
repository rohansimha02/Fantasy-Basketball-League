let userTeams = [];
let userTeamsMap = {};
let currentTeam = null;

async function initDropPlayer() {
    await loadUserTeamsDropdown();
    await loadTeamInfo();
}

async function loadUserTeamsDropdown() {
    try {
        const res = await fetch("/api/team/my-teams");
        const data = await res.json();
        if (data.status === "success" && data.teams.length > 0) {
            userTeams = data.teams;
            userTeamsMap = {};
            const dropdown = document.getElementById("team-switch-dropdown");
            dropdown.innerHTML = '<option value="">Select your team...</option>';
            for (const team of userTeams) {
                // Fetch league name for each team
                let leagueName = "";
                if (team.league && typeof team.league === "object" && team.league.leagueName) {
                    leagueName = team.league.leagueName;
                } else if (team.league) {
                    // Fetch league name if not populated
                    try {
                        const leagueRes = await fetch(`/api/leagues/${team.league}`);
                        const leagueData = await leagueRes.json();
                        leagueName = leagueData.leagueName || "";
                    } catch {}
                }
                const optionText = `${team.teamName} (${leagueName})`;
                dropdown.innerHTML += `<option value="${team.teamName}">${optionText}</option>`;
                userTeamsMap[team.teamName] = team;
            }
            // Set default selected team if not set
            if (!currentTeam && userTeams.length > 0) {
                dropdown.value = userTeams[0].teamName;
                currentTeam = userTeams[0];
            }
        }
    } catch (e) {
        // ignore
    }
}

async function onTeamSwitchChange() {
    const dropdown = document.getElementById("team-switch-dropdown");
    const selectedTeamName = dropdown.value;
    if (selectedTeamName && userTeamsMap[selectedTeamName]) {
        currentTeam = userTeamsMap[selectedTeamName];
        await loadTeamInfo(true); // force reload from backend
        document.getElementById('drop-player-message').innerHTML = "";
    }
}

async function loadTeamInfo(forceReload = false) {
    let teamData = null;
    if (currentTeam && currentTeam.teamName && !forceReload) {
        teamData = currentTeam;
    } else if (currentTeam && currentTeam.teamName && forceReload) {
        const res = await fetch(`/api/dropPlayer/team?teamName=${encodeURIComponent(currentTeam.teamName)}`);
        const data = await res.json();
        if (res.ok && data.status === "success") {
            teamData = data.team;
            userTeamsMap[currentTeam.teamName] = teamData;
        }
    } else {
        const res = await fetch('/api/dropPlayer/team');
        const data = await res.json();
        if (res.ok && data.status === "success") {
            teamData = data.team;
        }
    }

    if (teamData) {
        document.getElementById('team-name').textContent = teamData.teamName;
        const membersList = document.getElementById('members-list');
        membersList.innerHTML = '';

        (teamData.members || []).forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            memberItem.innerHTML = `
                ${member}
                <button class="btn btn-danger btn-sm" onclick="dropPlayer('${member}')">Remove</button>
            `;
            membersList.appendChild(memberItem);
        });
    } else {
        document.getElementById('drop-player-message').innerHTML =
            `<div class="alert alert-danger">Failed to load team info.</div>`;
    }
}

async function dropPlayer(player) {
    const teamName = (currentTeam && currentTeam.teamName) || document.getElementById('team-name').textContent;
    const res = await fetch('/api/dropPlayer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, player })
    });

    const data = await res.json();
    const msgDiv = document.getElementById('drop-player-message');

    if (res.ok && data.status === "success") {
        msgDiv.innerHTML = `<div class="alert alert-success">Player dropped successfully!</div>`;
        // Refresh the team info from backend after drop
        await loadTeamInfo(true);
    } else {
        msgDiv.innerHTML = `<div class="alert alert-danger">${data.message || 'Failed to drop player.'}</div>`;
    }
}

// Expose onTeamSwitchChange to global scope
window.onTeamSwitchChange = onTeamSwitchChange;

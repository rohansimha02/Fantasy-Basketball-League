document.addEventListener('DOMContentLoaded', async () => {
    const leagueSelect = document.getElementById('leagueSelect');
    const tbody = document.querySelector('#leaderboard tbody');

    const leaguesRes = await fetch('/api/leagues');
    const leagues = await leaguesRes.json();
    leagueSelect.innerHTML = leagues.map(l =>
        `<option value="${l._id}">${l.leagueName}</option>`
    ).join('');
    let leagueId = leagueSelect.value;

    async function loadLeaderboard(leagueId) {
        tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
        try {
            const res = await fetch(`/api/leaderboard/${leagueId}`);
            const data = await res.json();
            if (!Array.isArray(data)) {
                tbody.innerHTML = `<tr><td colspan="6">Error loading leaderboard.</td></tr>`;
                return;
            }
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6">No teams in this league.</td></tr>`;
                return;
            }
            tbody.innerHTML = data.map((team, idx) => {
                let topPlayer = '';
                let topPoints = -Infinity;
                if (team.memberPoints) {
                    for (const [player, pts] of Object.entries(team.memberPoints)) {
                        if (pts > topPoints) {
                            topPoints = pts;
                            topPlayer = player;
                        }
                    }
                }
                return `<tr>
                    <td>${idx + 1}</td>
                    <td>${team.teamName}</td>
                    <td>${team.username || ''}</td>
                    <td>${topPlayer || ''}</td>
                    <td>${team.totalPoints}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewTeam('${encodeURIComponent(team.teamName)}','${encodeURIComponent(team.username)}')">View Team</button>
                    </td>
                </tr>`;
            }).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6">Error: ${err.message}</td></tr>`;
        }
    }

    loadLeaderboard(leagueId);

    leagueSelect.addEventListener('change', (e) => {
        leagueId = e.target.value;
        loadLeaderboard(leagueId);
    });

    window.viewTeam = function (teamName, username) {
        window.location.href = `/team-viewer.html?teamName=${teamName}&username=${username}`;
    };
});
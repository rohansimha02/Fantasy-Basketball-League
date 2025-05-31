document.addEventListener('DOMContentLoaded', async () => {
    const teamsList = document.getElementById('teams-list');
    teamsList.innerHTML = 'Loading...';

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    const teamNameParam = getQueryParam('teamName');
    const usernameParam = getQueryParam('username');

    try {
        let teams = [];
        if (teamNameParam && usernameParam) {
            const res = await fetch(`/api/team/team-by-name?teamName=${encodeURIComponent(teamNameParam)}&username=${encodeURIComponent(usernameParam)}`);
            const data = await res.json();
            if (data.status !== 'success') {
                teamsList.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                return;
            }
            teams = [data.team];
        } else {
            const res = await fetch('/api/team/my-teams');
            const data = await res.json();
            if (data.status !== 'success') {
                teamsList.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                return;
            }
            teams = data.teams;
        }

        if (teams.length === 0) {
            teamsList.innerHTML = '<div class="alert alert-info">No matching team found.</div>';
            return;
        }

        const leaguesRes = await fetch('/api/leagues');
        const leagues = await leaguesRes.json();
        const leagueMap = {};
        leagues.forEach(l => { leagueMap[l._id] = l.leagueName; });

        teamsList.innerHTML = teams.map(team => `
            <div class="card mb-3">
                <div class="card-body text-dark" style="background: #fff;">
                    <h5 class="card-title">${team.teamName}</h5>
                    <p class="card-text"><strong>Members:</strong> ${team.members.join(', ')}</p>
                    <p class="card-text"><strong>League:</strong> ${leagueMap[team.league] || team.league}</p>
                    <p class="card-text"><strong>Username:</strong> ${team.username}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        teamsList.innerHTML = `<div class="alert alert-danger">Failed to load teams.</div>`;
    }
});
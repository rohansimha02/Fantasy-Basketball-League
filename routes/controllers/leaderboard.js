import express from 'express';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const router = express.Router();

function buildPlayerPointsMap(records) {
  const map = {};
  for (const player of records) {
    const pts = Number(player.PTS) || 0;
    const fg3m = Number(player['3P']) || 0;
    const fga = Number(player.FGA) || 0;
    const fgm = Number(player.FG) || 0;
    const fta = Number(player.FTA) || 0;
    const ftm = Number(player.FT) || 0;
    const reb = Number(player.TRB) || 0;
    const ast = Number(player.AST) || 0;
    const stl = Number(player.STL) || 0;
    const blk = Number(player.BLK) || 0;
    const tov = Number(player.TOV) || 0;

    const fantasyPoints =
      pts * 1 +
      fg3m * 1 +
      fga * -1 +
      fgm * 2 +
      fta * -1 +
      ftm * 1 +
      reb * 1 +
      ast * 2 +
      stl * 4 +
      blk * 4 +
      tov * -2;

    map[player.Player.trim()] = fantasyPoints;
  }
  return map;
}

router.get('/:leagueId', async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const models = req.models || (await import('../../models.js')).default;
    const teams = await models.Post.find({ league: leagueId }).lean();

    const csvPath = path.join(process.cwd(), 'data', 'players.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });
    const playerPoints = buildPlayerPointsMap(records);

    const standings = teams.map(team => {
      const memberPoints = {};
      let totalPoints = 0;
      (team.members || []).forEach(member => {
        const pts = playerPoints[member.trim()] || 0;
        memberPoints[member.trim()] = pts;
        totalPoints += pts;
      });
      return {
        _id: team._id,
        teamName: team.teamName,
        username: team.username,
        members: team.members,
        memberPoints,
        totalPoints
      };
    });

    standings.sort((a, b) => b.totalPoints - a.totalPoints);
    res.json(standings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to build standings' });
  }
});

export default router;
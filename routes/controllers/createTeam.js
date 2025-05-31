import express from "express";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
var router = express.Router();

async function isPlayerInAnyTeam(req, playerName) {
  const allTeams = await req.models.Post.find({});
  return allTeams.some((team) => team.members.includes(playerName));
}

async function isPlayerInAnyTeamInLeague(req, playerName, leagueId) {
  const allTeams = await req.models.Post.find({ league: leagueId });
  return allTeams.some((team) => team.members.includes(playerName));
}

router.post("/create", async (req, res, next) => {
  if (req.session.isAuthenticated) {
    const username = req.session.account.username;
    const { teamName, members, leagueId } = req.body;
    try {
      const teamData = await req.models.Post.exists({ teamName });
      if (teamData) {
        return res.json({ status: "error", message: "team already exists" });
      }

      // Check if any player is already in another team in the same league
      for (const player of members) {
        if (await isPlayerInAnyTeamInLeague(req, player, leagueId)) {
          return res.json({
            status: "error",
            message: `Player ${player} is already on another team in this league`,
          });
        }
      }

      // Create new team
      const newTeamData = new req.models.Post({
        username,
        teamName,
        members,
        league: leagueId,
        created_date: Date.now(),
      });
      await newTeamData.save();
      res.json({
        status: "success",
        message: "team created",
        team: newTeamData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: error.message });
    }
  } else {
    res.status(401).json({ status: "error", message: "not logged in" });
  }
});

router.get("/player-names", async (req, res) => {
  const csvPath = path.join(process.cwd(), "data", "players.csv");
  const playerNames = [];
  fs.createReadStream(csvPath)
    .pipe(parse({ columns: true }))
    .on("data", (row) => {
      if (row.Player && !playerNames.includes(row.Player)) {
        playerNames.push(row.Player.trim());
      }
    })
    .on("end", () => {
      res.json(playerNames);
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to read player names" });
    });
});

router.get('/my-teams', async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ status: "error", message: "not logged in" });
  }
  const username = req.session.account.username;
  try {
    const teams = await req.models.Post.find({ username }).lean();
    res.json({ status: "success", teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/all-teams', async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ status: "error", message: "not logged in" });
  }
  try {
    // Add leagueId to the response
    const teams = await req.models.Post.find({}, 'teamName members league').lean();
    res.json({ status: "success", teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/team-by-name', async (req, res) => {
  const { teamName, username } = req.query;
  if (!teamName || !username) {
    return res.status(400).json({ status: "error", message: "Missing teamName or username" });
  }
  try {
    const team = await req.models.Post.findOne({ teamName, username }).lean();
    if (!team) {
      return res.status(404).json({ status: "error", message: "Team not found" });
    }
    res.json({ status: "success", team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;

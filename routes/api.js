import express from "express"
var router = express.Router();

import createTeamRouter from "./controllers/createTeam.js";
import addPlayerRouter from "./controllers/addPlayer.js";
import dropPlayerRouter from "./controllers/dropPlayer.js";
import usersRouter from "./controllers/users.js"
import leaderboardRouter from "./controllers/leaderboard.js";
import leaguesRouter from "./controllers/leagues.js";

router.use("/team", createTeamRouter)
router.use("/addPlayer", addPlayerRouter)
router.use("/dropPlayer", dropPlayerRouter)
router.use("/users", usersRouter)
router.use("/leagues", leaguesRouter)
router.use("/leaderboard", leaderboardRouter)

export default router;
import express from "express";
var router = express.Router();

router.delete("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    const { teamName, player } = req.body;
    try {
      const team = await req.models.Post.findOne({ teamName });
      if (team) {
        team.members = team.members.filter((m) => m !== player);
        await team.save();
        res
          .status(200)
          .json({ status: "success", message: "player dropped", team });
      } else {
        res.json({ status: "error", message: "team does not exist" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: error.message });
    }
  } else {
    res.status(401).json({ status: "error", message: "not logged in" });
  }
});

router.get("/team", async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ status: "error", message: "not logged in" });
  }

  try {
    // Support ?teamName=... for switching teams
    const teamName = req.query.teamName;
    let team;
    if (teamName) {
      team = await req.models.Post.findOne({ teamName });
    } else {
      team = await req.models.Post.findOne({
        username: req.session.account.username,
      });
    }
    if (team) {
      res.status(200).json({ status: "success", team });
    } else {
      res.status(404).json({ status: "error", message: "team not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;

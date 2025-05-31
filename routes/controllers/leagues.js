import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const leagues = await req.models.League.find({});
        res.json(leagues);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
});

// Get a specific league by ID
router.get('/:leagueId', async (req, res) => {
    try {
        const league = await req.models.League.findById(req.params.leagueId);
        if (league) {
            res.json(league);
        } else {
            res.status(404).json({ error: 'League not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch league' });
    }
});

// Get teams in a specific league
router.get('/:leagueId/teams', async (req, res) => {
    try {
        const teams = await req.models.Post.find({ league: req.params.leagueId }).lean();
        res.json({ status: 'success', teams });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Create a new league
router.post('/', async (req, res) => {
    if (req.session.isAuthenticated) {
        const { leagueName } = req.body;
        try {
            const existingLeague = await req.models.League.findOne({ leagueName });
            if (!existingLeague) {
                const newLeague = new req.models.League({
                    leagueName
                });
                await newLeague.save();
                res.json({ status: 'success', message: 'League created', league: newLeague });
            } else {
                res.json({ status: 'error', message: 'League already exists' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 'error', message: error.message });
        }
    } else {
        res.status(401).json({ status: 'error', message: 'not logged in' });
    }
});

export default router;
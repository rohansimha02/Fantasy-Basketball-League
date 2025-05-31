import express from 'express';
const router = express.Router();

router.get('/myIdentity', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.json({
            status: "loggedin",
            userInfo: {
                name: req.session.account.name,
                username: req.session.account.username
            },
            shouldRedirect: req.query.redirect === 'true'
        });
    } else {
        return res.json({ status: "loggedout" });
    }
});

export default router;
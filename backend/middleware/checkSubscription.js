const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.isSubscribed) {
            const now = new Date();
            if (user.subscriptionExpiresAt < now) {
                // Subscription has expired
                user.isSubscribed = false;
                await user.save();
                return res.status(402).json({ error: "Subscription expired. Please pay to renew." });
            } else {
                // User is subscribed
                next();
            }
        } else {
            return res.status(402).json({ error: "You need to be subscribed to access this feature." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = checkSubscription;

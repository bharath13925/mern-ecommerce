const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token not provided" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // here after verify the decoded variable has "id and role while we craete token we use that ones only after verify the token you may get the role and user id that can be passed to below authorize function"

        // Attach user to request just like normal attcahment not any miracle
        req.user = decoded;

        next(); // go to the next middleware or function in the chain
    } catch (err) {
        console.log("Auth Error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const authorize = (...roles) => { // here roles means in productRoutes we sent as "admin" so the roles here is the admin
    return (req, res, next) => {
        try {
            // Check user exists (protect should run before this)
            if (!req.user) { // here checks the above verification of token happened or not if happened then the req has "user" else not be there
                return res.status(401).json({ message: "User not authenticated" });
            }

            // Check role
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: Access denied" });
            }

            next();
        } catch (err) {
            console.log("Authorization Error:", err);
            return res.status(500).json({ message: "Server error in authorization" });
        }
    };
};

module.exports = { protect, authorize };
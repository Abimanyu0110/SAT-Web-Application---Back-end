import { verifyAccessToken } from "../utils/tokenUtil.js";

// -------- Database Connection file ------------
import db from "../Config/db.js";

const authorize = (config) => {
    return async (req, res, next) => {

        /* 1. Auth required check */
        if (!config.auth?.required) return next();

        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ message: "Token required" });

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch {
            return res.status(401).json({ message: "Invalid token" });
        }

        /* 2. Token existence check in admin table */
        const [[admin]] = await db.query(
            `SELECT id, role FROM admins
            WHERE accessToken = ? AND tokenExpiresAt > NOW()`,
            [token]
        );

        if (!admin)
            return res.status(401).json({ message: "Session expired" });

        /* 3. Role check */
        if (config.access && !config.access.includes(admin.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        req.admin = admin;
        next();
    };
};

export default { authorize };
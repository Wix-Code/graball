import { Router } from "express";
import { unFollow, getFollowers, getFollowing, followUser, } from "../controllers/follow.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware";
export default (io) => {
    const router = Router();
    // ✅ Follow a user
    router.post("/follow-user", authenticateToken, followUser(io));
    // ✅ Unfollow a user
    router.post("/unfollow-user", unFollow);
    // ✅ Get followers
    router.get("/followers", getFollowers);
    // ✅ Get following
    router.get("/following", getFollowing);
    return router;
};
//# sourceMappingURL=follow.route.js.map
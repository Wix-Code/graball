import { Router } from "express";
import { Server } from "socket.io";
import {
  unFollow,
  getFollowers,
  getFollowing,
  followUser,
} from "@/controllers/follow.controller";

export default (io: Server) => {
  const router = Router();

  // ✅ Follow a user
  router.post("/follow-user", followUser(io));

  // ✅ Unfollow a user
  router.post("/unfollow-user", unFollow);

  // ✅ Get followers
  router.get("/followers", getFollowers);

  // ✅ Get following
  router.get("/following", getFollowing);

  return router;
};
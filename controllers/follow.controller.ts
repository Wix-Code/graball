import prisma from "@/config/prismaConnect";
import { notifyUserFollow } from "@/utils/notificationHelper";
import { Request, Response } from "express";
import { Server } from "socket.io";

export const followUser = (io: Server) => async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id; // logged-in user
    const { userId } = req.body; // person being followed

    if (!followerId) {
      return res.status(401).json({ error: "Unauthorized or missing user ID" });
    }

    const followingId = Number(userId);
    if (!followerId || !followingId || isNaN(followerId) || isNaN(followingId)) {
      return res.status(400).json({ error: "Invalid follower or following user ID" });
    }

    if (!followingId) {
      return res.status(400).json({ error: "Invalid following user ID" });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // ✅ Check if already following
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // ✅ Create follow record
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // ✅ Get follower name for notification
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { firstName: true, lastName: true },
    });

    const followerName = `${follower?.firstName ?? ""} ${follower?.lastName ?? ""}`.trim() || "Someone";

    // ✅ Send follow notification
    console.log("🔔 Sending follow notification to", followingId, "from", followerId);
    await notifyUserFollow(io, followingId, followerName);
    console.log("✅ Follow notification sent (or saved)");


    res.status(201).json({status: true, message: "Followed successfully", data: follow });
  } catch (error) {
    console.error("❌ Follow error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



/**
 * ✅ Unfollow a user
 */
export const unFollow = async (req: Request, res: Response) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: "Both followerId and followingId are required" });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    res.status(200).json({
      status: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ✅ Get a user's followers
 */
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: Number(userId) },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json({
      status: true,
      message: "Followers fetched successfully",
      data: followers.map((f) => f.follower),
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ✅ Get users the current user is following
 */
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: Number(userId) },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json({
      status: true,
      message: "Following fetched successfully",
      data: following.map((f) => f.following),
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
import prisma from "@/config/prismaConnect";
import { notifyUserFollow } from "@/utils/notificationHelper";
import { Request, Response } from "express";
import { Server } from "socket.io";

export const followUser = (io: Server) => async (req: Request, res: Response) => {
  try {
    const { userId } = req.body; // user being followed
    const followerId = req?.user?.id; // logged-in user

    if (!followerId) {
      return res.status(400).json({ error: "Unauthorized or missing user ID" });
    }
    
    // Create follow record
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: Number(userId),
      },
    });

    // Fetch follower name
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { firstName: true, lastName: true },
    });

    // Notify the followed user
    const followerName = `${follower?.firstName} ${follower?.lastName}`;
    await notifyUserFollow(req.app.get("io"), userId, followerName);

    res.status(201).json({ message: "Followed successfully", follow });
  } catch (error) {
    console.error("Follow error:", error);
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
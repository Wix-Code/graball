import { Request, Response } from "express";
import { Server } from "socket.io";
export declare const followUser: (io: Server) => (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * ✅ Unfollow a user
 */
export declare const unFollow: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * ✅ Get a user's followers
 */
export declare const getFollowers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * ✅ Get users the current user is following
 */
export declare const getFollowing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=follow.controller.d.ts.map
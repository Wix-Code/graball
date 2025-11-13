import { Request, Response } from "express";
import { Server } from "socket.io";
export declare const sendMessage: (io: Server) => (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrCreateConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserConversations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markMessagesAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=message.controller.d.ts.map
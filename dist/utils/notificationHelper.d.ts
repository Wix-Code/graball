import { Server } from "socket.io";
import { NotificationType } from "../../generated/prisma/index.js";
export declare const createAndSendNotification: (io: Server, userId: number, title: string, message: string, type: NotificationType) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
export declare const notifyNewMessage: (io: Server, receiverId: number, senderName: string, messagePreview: string) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
export declare const notifyNewOrder: (io: Server, sellerId: number, buyerName: string, productName: string, orderRef: string) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
export declare const notifyOrderStatusUpdate: (io: Server, buyerId: number, status: string, orderRef: string) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
export declare const notifyPromotion: (io: Server, userId: number, promotionTitle: string, promotionMessage: string) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
export declare const notifySystemAlert: (io: Server, userId: number, alertTitle: string, alertMessage: string) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
export declare const broadcastNotification: (io: Server, userIds: number[], title: string, message: string, type: NotificationType) => Promise<(({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null)[] | null>;
export declare const notifyUserFollow: (io: Server, followedUserId: number, // the person being followed
followerName: string) => Promise<({
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        id: number;
    };
} & {
    id: number;
    createdAt: Date;
    userId: number;
    title: string;
    message: string;
    type: import("../../generated/prisma/index.js").$Enums.NotificationType;
    isRead: boolean;
}) | null>;
//# sourceMappingURL=notificationHelper.d.ts.map
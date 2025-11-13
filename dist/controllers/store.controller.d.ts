import type { Request, Response } from "express";
export declare const addStore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateStore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteStore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStoreById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllStores: (req: Request, res: Response) => Promise<void>;
export declare const getMyStore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=store.controller.d.ts.map
import type { Request, Response } from "express";
export declare const addCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateStore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteStore: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllCategories: (req: Request, res: Response) => Promise<void>;
export declare const getProductsByCategoryId: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map
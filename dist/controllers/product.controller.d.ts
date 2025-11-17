import type { Request, Response } from "express";
export declare const addProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProductsByStore: (req: Request, res: Response) => Promise<void>;
export declare const getMyProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProductById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductsByCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRelatedProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=product.controller.d.ts.map
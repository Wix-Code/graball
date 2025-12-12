import { Request, Response } from "express";
export declare const addSaved: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSaved: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const unsaveProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeAllSaved: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeSaved: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=saved.controller.d.ts.map
import prisma from "@/config/prismaConnect";
import { Request, Response } from "express";
import { notifySavedProduct, notifyUnsavedProduct } from "../utils/notificationHelper.js";

// =============== ADD SAVED PRODUCT ==================
export const addSaved = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // from verifyToken
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const numericProductId = Number(productId);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: numericProductId },
      include: { 
        store: {
          include: {
            owner: true  // Include the owner through the store relation
          }
        }
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create or return existing saved item
    const saved = await prisma.savedProduct.upsert({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: numericProductId,
        },
      },
      update: {},
      create: {
        userId: Number(userId),
        productId: numericProductId,
      },
    });

    // Send notification to product owner (if not saving own product)
    if (product.store.ownerId !== userId) {
      const saver = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { firstName: true, lastName: true },
      });

      const saverName =
        `${saver?.firstName ?? ""} ${saver?.lastName ?? ""}`.trim() || "Someone";

      await notifySavedProduct(
        req.app.get("io"), // socket.io instance
        product.store.ownerId, // owner ID
        saverName, // who saved
        product.name // product name
      );
    }

    return res.status(201).json({
      message: "Product saved successfully",
      saved,
    });
  } catch (error) {
    console.error("Save Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// =============== GET ALL SAVED PRODUCTS (PAGINATED) ==================
export const getSaved = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Optional filters
    const categoryId = req.query.categoryId 
      ? parseInt(req.query.categoryId as string) 
      : undefined;
    const search = req.query.search as string;

    // Build where clause
    const where: any = {
      userId: Number(userId),
    };

    // Add product filters if provided
    if (categoryId || search) {
      where.product = {};
      
      if (categoryId) {
        where.product.categoryId = categoryId;
      }
      
      if (search) {
        where.product.name = {
          contains: search,
          mode: 'insensitive'
        };
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.savedProduct.count({ where });

    // Get paginated saved products
    const savedProducts = await prisma.savedProduct.findMany({
      where,
      include: {
        product: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                location: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                img: true,
              }
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: savedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Get Saved Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// =============== UNSAVE PRODUCT ==================
export const unsaveProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const numericProductId = Number(productId);

    // Check if saved product exists and get product details
    const savedProduct = await prisma.savedProduct.findUnique({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: numericProductId,
        },
      },
      include: {
        product: {
          include: {
            store: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    });

    if (!savedProduct) {
      return res.status(404).json({ message: "Product was not saved" });
    }

    // Delete the saved product
    await prisma.savedProduct.delete({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: numericProductId,
        },
      },
    });

    // Send notification to product owner (if not unsaving own product)
    if (savedProduct.product.store.ownerId !== userId) {
      const unsaver = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { firstName: true, lastName: true },
      });

      const unsaverName =
        `${unsaver?.firstName ?? ""} ${unsaver?.lastName ?? ""}`.trim() || "Someone";

      await notifyUnsavedProduct(
        req.app.get("io"), // socket.io instance
        savedProduct.product.store.ownerId, // owner ID
        unsaverName, // who unsaved
        savedProduct.product.name // product name
      );
    }

    return res.status(200).json({
      message: "Product unsaved successfully",
    });
  } catch (error) {
    console.error("Unsave Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// =============== REMOVE ALL SAVED PRODUCTS ==================
export const removeAllSaved = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get count before deletion for response
    const countBeforeDelete = await prisma.savedProduct.count({
      where: { userId: Number(userId) },
    });

    if (countBeforeDelete === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No saved products found" 
      });
    }

    // Delete all saved products for this user
    const result = await prisma.savedProduct.deleteMany({
      where: { userId: Number(userId) },
    });

    return res.status(200).json({
      success: true,
      message: "All saved products removed successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Remove All Saved Error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const removeSaved = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const numericProductId = Number(productId);

    // Check if saved product exists and get product details
    const savedProduct = await prisma.savedProduct.findUnique({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: numericProductId,
        },
      },
      include: {
        product: {
          include: {
            store: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    });

    if (!savedProduct) {
      return res.status(404).json({ message: "Product was not saved" });
    }

    // Delete the saved product
    await prisma.savedProduct.delete({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: numericProductId,
        },
      },
    });

    // Send notification to product owner (if not unsaving own product)
    if (savedProduct.product.store.ownerId !== userId) {
      const unsaver = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { firstName: true, lastName: true },
      });

      const unsaverName =
        `${unsaver?.firstName ?? ""} ${unsaver?.lastName ?? ""}`.trim() || "Someone";

      await notifyUnsavedProduct(
        req.app.get("io"), // socket.io instance
        savedProduct.product.store.ownerId, // owner ID
        unsaverName, // who unsaved
        savedProduct.product.name // product name
      );
    }

    return res.status(200).json({
      message: "Product removed from saved list successfully",
    });
  } catch (error) {
    console.error("Remove Saved Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
import prisma from "@/config/prismaConnect";
import { Request, Response } from "express";
import { notifySavedProduct } from "../utils/notificationHelper.js";

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
      include: { store: true, storeOwner: true },
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
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      const saverName = `${saver?.firstName ?? ""} ${saver?.lastName ?? ""}`.trim();

      await notifySavedProduct(
        req.app.get("io"),          // socket.io instance
        product.store.ownerId,      // owner ID
        saverName,                  // who saved
        product.name                // product name
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

// =============== GET ALL SAVED PRODUCTS ==================
export const getSaved = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;

    const savedProducts = await prisma.savedProduct.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      count: savedProducts.length,
      savedProducts,
    });
  } catch (error) {
    console.error("Get Saved Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
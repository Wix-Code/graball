import prisma from "../config/prismaConnect.js";
import type { Request, Response } from "express";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, storeId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const parsedStoreId = Number(storeId);
    if (isNaN(parsedStoreId)) {
      return res.status(400).json({ error: "Invalid store ID" });
    }

    const store = await prisma.store.findFirst({
      where: { id: parsedStoreId, ownerId: userId },
    });

    if (!store) {
      return res.status(403).json({ error: "You do not own this store" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
       // imageUrl,
        store: {
          connect: { id: parsedStoreId },
        },
      },
    });

    return res.status(201).json({ status: false, message: "Product added successfully", product: product });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductsByStore = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;

    const products = await prisma.product.findMany({
      where: { storeId: Number(storeId) }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price
      }
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
  
    const product = await prisma.product.findMany({});

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
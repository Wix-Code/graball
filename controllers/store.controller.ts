import prisma from "../config/prismaConnect.js";
import type { Request, Response } from "express";

export const addStore = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, location } = req.body;
    const userId = req.user?.id;

    console.log(userId, "user id")

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const existingStoreName = await prisma.store.findFirst({ where: { name: name } });
    if (existingStoreName) {
      return res.status(400).json({ error: "Store name already exit." });
    }

    const existingStore = await prisma.store.findFirst({ where: { ownerId: userId } });
    if (existingStore) {
      return res.status(400).json({ error: "You already have a store." });
    }

    const store = await prisma.store.create({
      data: {
        name,
        description,
        imageUrl,
        location,
        owner: {
          connect: { id: userId }, 
        },
      },
    });

    res.status(201).json({status: false, message: "Store created successfully", store: store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, location, imageUrl } = req.body;
    const userId = req.user?.id;

    console.log(userId, "user id")

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const store = await prisma.store.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        imageUrl,
        location
      }
    });

    res.status(200).json({status: false, message: "Store updated successfully", store: store});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log(userId, "user id")

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    await prisma.store.delete({
      where: { id: Number(id) }
    });

    res.status(204).send({status: false, message: "Store deleted successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: Number(id) }
    });

    if (!store) {
      return res.status(404).json({ error: "store not found" });
    }

    res.status(200).json({ status: false, message: "Store fetched successfully", store: store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: true, // 👈 include related products
      },
    });

    if (!stores || stores.length === 0) {
      return res.status(404).json({ error: "No stores found" });
    }

    res.status(200).json({ 
      status: true, 
      message: "Stores fetched successfully", 
      stores 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
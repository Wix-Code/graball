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
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ status: false, error: "Store slug is required" });
    }

    // Handle both cases: "2" or "2-red-palm-oil"
    const storeId = Number(slug.split("-")[0]);

    if (isNaN(storeId)) {
      return res.status(400).json({ status: false, error: "Invalid store ID" });
    }

    const store = await prisma.store.findUnique({
      where: { id: Number(storeId) },
      include: {
        products: true,
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json({ 
      status: true, 
      message: "Store fetched successfully", 
      store: store 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllStores = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "newest"; // newest | oldest
    const location = (req.query.location as string) || "";

    const skip = (page - 1) * limit;

    // where conditions
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // sorting options (only valid store fields!)
    let orderBy: any = { createdAt: "desc" }; // default: newest

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" }; // newest
    }

    // fetch data + total count
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          products: true, // 👈 include products for each store
        },
      }),
      prisma.store.count({ where }),
    ]);

    res.status(200).json({
      status: true,
      message: "Stores fetched successfully",
      data: {
        stores,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
import prisma from "../config/prismaConnect.js";
import type { Request, Response } from "express";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, storeId, category } = req.body;
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
        imageUrl,
        category,
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

    res.status(200).json({ status: true, message: "Products fetched successfully", products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, category } = req.body;

    // Find the category by name (or create if it doesn’t exist)
    let existingCategory = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!existingCategory) {
      existingCategory = await prisma.category.create({
        data: { name: category },
      });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: Number(id) }, // product must exist
      data: {
        name,
        description,
        price,
        imageUrl,
        category: {
          connect: { id: existingCategory.id },
        },
      },
      include: { category: true }, // return the category too
    });

    res.status(200).json({ status: true, message: "Product fetched successfully", product: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) }
    });

    res.status(204).json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ status: false, error: "Product slug is required" });
    }

    // Handle both cases: "2" or "2-red-palm-oil"
    const productId = Number(slug.split("-")[0]);

    if (isNaN(productId)) {
      return res.status(400).json({ status: false, error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ status: false, error: "Product not found" });
    }

    res.status(200).json({
      status: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "newest"; // newest | oldest | highest | lowest
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
      where.location = location; // adjust to match your DB schema
    }

    // sorting options
    let orderBy: any = { createdAt: "desc" }; // default: newest

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { price: "desc" };
        break;
      case "lowest":
        orderBy = { price: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" }; // newest
    }

    // fetch data + total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: {
        products,
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
    console.error("Error fetching products:", error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, categoryName, page = "1", limit = "10", search } = req.query;

    if (!categoryId && !categoryName) {
      return res.status(400).json({ error: "Provide either categoryId or categoryName" });
    }

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build base query
    let whereClause: any = {};

    if (categoryId) {
      whereClause = {
        categories: {
          some: {
            categoryId: Number(categoryId),
          },
        },
      };
    }

    if (categoryName) {
      whereClause = {
        categories: {
          some: {
            category: {
              name: String(categoryName),
            },
          },
        },
      };
    }

    // Add search filter (by name or description)
    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { name: { contains: String(search), mode: "insensitive" } },
          { description: { contains: String(search), mode: "insensitive" } },
        ],
      };
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          store: true, // in case you want store details too
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      products,
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
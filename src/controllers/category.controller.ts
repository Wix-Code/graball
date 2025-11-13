import prisma from "../config/prismaConnect.js";
import type { Request, Response } from "express";

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    // const userId = req.user?.id;

    // console.log(userId, "user id");

    // if (!userId) {
    //   return res.status(400).json({ error: "User not authenticated" });
    // }

    const existingCategoryName = await prisma.category.findFirst({
      where: { name },
    });

    if (existingCategoryName) {
      return res.status(400).json({ error: "Category name already exists." });
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
      include: {
        products: true,
      },
    });

    res.status(201).json({
      status: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Add category error:", error);
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

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ 
      status: true, 
      message: "Single category fetched successfully", 
      category: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
         products: true 
      },
    });

    res.status(200).json({
      status: true,
      categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductsByCategoryId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // category id from URL

    const products = await prisma.product.findMany({
      where: { categoryId: Number(id) },
      include: { category: true },
    });

    res.status(200).json({
      status: true,
      categoryId: id,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getProductsByCategory = async (req: Request, res: Response) => {
//   try {
//     const { categoryId, categoryName, page = "1", limit = "10", search } = req.query;

//     if (!categoryId && !categoryName) {
//       return res.status(400).json({ error: "Provide either categoryId or categoryName" });
//     }

//     const pageNumber = parseInt(page as string, 10);
//     const pageSize = parseInt(limit as string, 10);
//     const skip = (pageNumber - 1) * pageSize;

//     // Build base query
//     let whereClause: any = {};

//     if (categoryId) {
//       whereClause = {
//         categories: {
//           some: {
//             categoryId: Number(categoryId),
//           },
//         },
//       };
//     }

//     if (categoryName) {
//       whereClause = {
//         categories: {
//           some: {
//             category: {
//               name: String(categoryName),
//             },
//           },
//         },
//       };
//     }

//     // Add search filter (by name or description)
//     if (search) {
//       whereClause = {
//         ...whereClause,
//         OR: [
//           { name: { contains: String(search), mode: "insensitive" } },
//           { description: { contains: String(search), mode: "insensitive" } },
//         ],
//       };
//     }

//     // Fetch products
//     const [products, total] = await Promise.all([
//       prisma.product.findMany({
//         where: whereClause,
//         skip,
//         take: pageSize,
//         orderBy: { createdAt: "desc" },
//         include: {
//           categories: {
//             include: { category: true },
//           },
//           store: true, // in case you want store details too
//         },
//       }),
//       prisma.product.count({ where: whereClause }),
//     ]);

//     res.status(200).json({
//       status: true,
//       message: "Products fetched successfully",
//       pagination: {
//         total,
//         page: pageNumber,
//         limit: pageSize,
//         totalPages: Math.ceil(total / pageSize),
//       },
//       products,
//     });
//   } catch (error) {
//     console.error("Get products by category error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
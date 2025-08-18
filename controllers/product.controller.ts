import prisma from "../config/prismaConnect.js";
import type { Request, Response } from "express";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, storeId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        store: {
          connect: { id: storeId }
        }
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

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
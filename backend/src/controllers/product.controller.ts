import { Request, Response, NextFunction } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  calculateSuggestedPrice,
} from '../services/product.service.js';
import { uploadImage, deleteImage } from '../services/storage.service.js';

export async function getProductsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoryIdParam = req.query.categoryId as string | undefined;
    const pageParam = req.query.page as string | undefined;
    const limitParam = req.query.limit as string | undefined;
    const includeInactiveParam = req.query.includeInactive as string | undefined;
    
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 25;
    const includeInactive = includeInactiveParam === 'true';
    
    const result = await getAllProducts(categoryId, { page, limit }, includeInactive);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idParam = req.params.id;
    
    if (!idParam || typeof idParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID parameter',
        },
      });
      return;
    }
    
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID',
        },
      });
      return;
    }

    const product = await getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description, categoryId, price, sku, stock } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name is required',
        },
      });
      return;
    }

    // Upload images (max 3)
    let imageUrl1: string | undefined;
    let imageUrl2: string | undefined;
    let imageUrl3: string | undefined;

    if (files) {
      const file1 = files.image1?.[0];
      const file2 = files.image2?.[0];
      const file3 = files.image3?.[0];
      if (file1) imageUrl1 = await uploadImage(file1.buffer, file1.originalname);
      if (file2) imageUrl2 = await uploadImage(file2.buffer, file2.originalname);
      if (file3) imageUrl3 = await uploadImage(file3.buffer, file3.originalname);
    }

    const categoryIdNumber = categoryId ? Number(categoryId) : undefined;
    if (categoryId && isNaN(categoryIdNumber as number)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid categoryId',
        },
      });
      return;
    }

    const priceNumber = price ? Number(price) : 0;
    const stockNumber = stock ? Number(stock) : 0;

    const product = await createProduct({
      name: name.trim(),
      description,
      categoryId: categoryIdNumber,
      imageUrl1,
      imageUrl2,
      imageUrl3,
      price: priceNumber,
      sku,
      stock: stockNumber,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CATEGORY_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
        return;
      }
      if (error.message === 'INVALID_PRICE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PRICE',
            message: 'Price must be positive',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function updateProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idParam = req.params.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (!idParam || typeof idParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID parameter',
        },
      });
      return;
    }
    
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID',
        },
      });
      return;
    }

    const { 
      name, description, categoryId, price, sku, stock, marginPercentage,
      deleteImage1, deleteImage2, deleteImage3 
    } = req.body;

    const updateData: {
      name?: string;
      description?: string | null;
      categoryId?: number | null;
      imageUrl1?: string | null;
      imageUrl2?: string | null;
      imageUrl3?: string | null;
      price?: number;
      sku?: string | null;
      stock?: number;
      marginPercentage?: number | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name cannot be empty',
          },
        });
        return;
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) updateData.description = description === null ? undefined : description;

    if (categoryId !== undefined) {
      if (categoryId === null) {
        // Don't include - remove category
      } else {
        const categoryIdNumber = Number(categoryId);
        if (isNaN(categoryIdNumber)) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid categoryId',
            },
          });
          return;
        }
        updateData.categoryId = categoryIdNumber;
      }
    }

    // Get existing product for image handling
    const existingProduct = await import('../services/product.service.js').then(m => m.getProductById(id));
    
    // Handle new file uploads
    if (files) {
      const file1 = files.image1?.[0];
      const file2 = files.image2?.[0];
      const file3 = files.image3?.[0];
      // Delete old images that will be replaced
      if (file1 && existingProduct?.imageUrl1) await deleteImage(existingProduct.imageUrl1);
      if (file2 && existingProduct?.imageUrl2) await deleteImage(existingProduct.imageUrl2);
      if (file3 && existingProduct?.imageUrl3) await deleteImage(existingProduct.imageUrl3);
      
      // Upload new images
      if (file1) updateData.imageUrl1 = await uploadImage(file1.buffer, file1.originalname);
      if (file2) updateData.imageUrl2 = await uploadImage(file2.buffer, file2.originalname);
      if (file3) updateData.imageUrl3 = await uploadImage(file3.buffer, file3.originalname);
    }
    
    // Handle delete flags
    if (deleteImage1 === 'true') {
      if (existingProduct?.imageUrl1) await deleteImage(existingProduct.imageUrl1);
      updateData.imageUrl1 = null;
    }
    if (deleteImage2 === 'true') {
      if (existingProduct?.imageUrl2) await deleteImage(existingProduct.imageUrl2);
      updateData.imageUrl2 = null;
    }
    if (deleteImage3 === 'true') {
      if (existingProduct?.imageUrl3) await deleteImage(existingProduct.imageUrl3);
      updateData.imageUrl3 = null;
    }

    if (price !== undefined) {
      const priceNumber = Number(price);
      if (isNaN(priceNumber)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid price',
          },
        });
        return;
      }
      updateData.price = priceNumber;
    }
    if (sku !== undefined) updateData.sku = sku;
    if (stock !== undefined) {
      const stockNumber = Number(stock);
      if (isNaN(stockNumber)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid stock',
          },
        });
        return;
      }
      updateData.stock = stockNumber;
    }
    if (marginPercentage !== undefined) {
      const marginNumber = Number(marginPercentage);
      if (isNaN(marginNumber)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid marginPercentage',
          },
        });
        return;
      }
      updateData.marginPercentage = marginNumber;
    }

    const product = await updateProduct(id, updateData);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }
      if (error.message === 'CATEGORY_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
        return;
      }
      if (error.message === 'INVALID_PRICE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PRICE',
            message: 'Price must be positive',
          },
        });
        return;
      }
      if (error.message === 'INVALID_STOCK') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STOCK',
            message: 'Stock cannot be negative',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function deleteProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idParam = req.params.id;
    
    if (!idParam || typeof idParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID parameter',
        },
      });
      return;
    }
    
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID',
        },
      });
      return;
    }

    // Get product to delete images
    const existingProduct = await import('../services/product.service.js').then(m => m.getProductById(id));
    if (existingProduct?.imageUrl1) await deleteImage(existingProduct.imageUrl1);
    if (existingProduct?.imageUrl2) await deleteImage(existingProduct.imageUrl2);
    if (existingProduct?.imageUrl3) await deleteImage(existingProduct.imageUrl3);

    await deleteProduct(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function toggleProductActiveController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idParam = req.params.id;
    
    if (!idParam || typeof idParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID parameter',
        },
      });
      return;
    }
    
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID',
        },
      });
      return;
    }

    const product = await toggleProductActive(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function getSuggestedPriceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idParam = req.params.id;

    if (!idParam || typeof idParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID parameter',
        },
      });
      return;
    }

    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product ID',
        },
      });
      return;
    }

    const result = await calculateSuggestedPrice(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }
    }
    next(error);
  }
}

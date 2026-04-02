import { Request, Response, NextFunction } from 'express';
import {
  getAllSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
  getSuppliesByProduct,
  addSupplyToProduct,
  updateSupplyInProduct,
  removeSupplyFromProduct,
} from '../services/supply.service.js';

export async function getSuppliesController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supplies = await getAllSupplies();

    res.status(200).json({
      success: true,
      data: supplies,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSupplyController(
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
          message: 'Invalid supply ID parameter',
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
          message: 'Invalid supply ID',
        },
      });
      return;
    }

    const supply = await getSupplyById(id);

    if (!supply) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supply not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: supply,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSupplyController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, cost } = req.body;

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

    const costNumber = Number(cost);

    if (isNaN(costNumber) || costNumber <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cost must be a positive number',
        },
      });
      return;
    }

    const supply = await createSupply({
      name: name.trim(),
      cost: costNumber,
    });

    res.status(201).json({
      success: true,
      data: supply,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NAME_REQUIRED') {
        res.status(400).json({
          success: false,
          error: {
            code: 'NAME_REQUIRED',
            message: 'Name is required',
          },
        });
        return;
      }
      if (error.message === 'INVALID_COST') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COST',
            message: 'Cost must be a positive number',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function updateSupplyController(
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
          message: 'Invalid supply ID parameter',
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
          message: 'Invalid supply ID',
        },
      });
      return;
    }

    const { name, cost } = req.body;

    const updateData: {
      name?: string;
      cost?: number;
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

    if (cost !== undefined) {
      const costNumber = Number(cost);
      if (isNaN(costNumber) || costNumber <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cost must be a positive number',
          },
        });
        return;
      }
      updateData.cost = costNumber;
    }

    const supply = await updateSupply(id, updateData);

    res.status(200).json({
      success: true,
      data: supply,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Supply not found',
          },
        });
        return;
      }
      if (error.message === 'NAME_REQUIRED') {
        res.status(400).json({
          success: false,
          error: {
            code: 'NAME_REQUIRED',
            message: 'Name is required',
          },
        });
        return;
      }
      if (error.message === 'INVALID_COST') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COST',
            message: 'Cost must be a positive number',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function deleteSupplyController(
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
          message: 'Invalid supply ID parameter',
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
          message: 'Invalid supply ID',
        },
      });
      return;
    }

    await deleteSupply(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Supply not found',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function getProductSuppliesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productIdParam = req.params.productId;

    if (!productIdParam || typeof productIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId parameter',
        },
      });
      return;
    }

    const productId = parseInt(productIdParam, 10);

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId',
        },
      });
      return;
    }

    const supplies = await getSuppliesByProduct(productId);

    res.status(200).json({
      success: true,
      data: supplies,
    });
  } catch (error) {
    next(error);
  }
}

export async function addSupplyToProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productIdParam = req.params.productId;

    if (!productIdParam || typeof productIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId parameter',
        },
      });
      return;
    }

    const productId = parseInt(productIdParam, 10);

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId',
        },
      });
      return;
    }

    const { supplyId, quantity } = req.body;

    if (!supplyId || typeof supplyId !== 'number') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'supplyId is required',
        },
      });
      return;
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'quantity must be a positive number',
        },
      });
      return;
    }

    const result = await addSupplyToProduct(productId, {
      supplyId,
      quantity,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }
      if (error.message === 'SUPPLY_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUPPLY_NOT_FOUND',
            message: 'Supply not found',
          },
        });
        return;
      }
      if (error.message === 'INVALID_QUANTITY') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Quantity must be a positive number',
          },
        });
        return;
      }
      if (error.message === 'SUPPLY_ALREADY_LINKED') {
        res.status(400).json({
          success: false,
          error: {
            code: 'SUPPLY_ALREADY_LINKED',
            message: 'Supply is already linked to this product',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function updateSupplyInProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productIdParam = req.params.productId;
    const supplyIdParam = req.params.supplyId;

    if (!productIdParam || typeof productIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId parameter',
        },
      });
      return;
    }

    const productId = parseInt(productIdParam, 10);
    const supplyId = parseInt(supplyIdParam, 10);

    if (isNaN(productId) || isNaN(supplyId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId or supplyId',
        },
      });
      return;
    }

    const { quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'quantity must be a positive number',
        },
      });
      return;
    }

    const result = await updateSupplyInProduct(productId, supplyId, { quantity });

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
            message: 'Product supply relationship not found',
          },
        });
        return;
      }
      if (error.message === 'INVALID_QUANTITY') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Quantity must be a positive number',
          },
        });
        return;
      }
    }
    next(error);
  }
}

export async function removeSupplyFromProductController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productIdParam = req.params.productId;
    const supplyIdParam = req.params.supplyId;

    if (!productIdParam || typeof productIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId parameter',
        },
      });
      return;
    }

    const productId = parseInt(productIdParam, 10);
    const supplyId = parseInt(supplyIdParam, 10);

    if (isNaN(productId) || isNaN(supplyId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid productId or supplyId',
        },
      });
      return;
    }

    await removeSupplyFromProduct(productId, supplyId);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product supply relationship not found',
          },
        });
        return;
      }
    }
    next(error);
  }
}
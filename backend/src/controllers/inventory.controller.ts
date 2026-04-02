import { Request, Response, NextFunction } from 'express';
import {
  getAllInventory,
  getProductInventory,
  adjustStock,
  getLowStockAlerts,
  getInventoryStats,
} from '../services/inventory.service.js';

export async function getInventoryController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const inventory = await getAllInventory();

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductInventoryController(
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

    const product = await getProductInventory(productId);

    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
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

export async function adjustStockController(
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

    const { quantity, operation } = req.body;

    if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Quantity is required and must be a positive number',
        },
      });
      return;
    }

    if (!operation || !['add', 'set'].includes(operation)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operation is required and must be "add" or "set"',
        },
      });
      return;
    }

    const product = await adjustStock(productId, { quantity, operation });

    res.status(200).json({
      success: true,
      data: product,
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

      if (error.message === 'PRODUCT_NOT_ACTIVE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_ACTIVE',
            message: 'Product is not active',
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

export async function getLowStockAlertsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const alerts = await getLowStockAlerts();

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getInventoryStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
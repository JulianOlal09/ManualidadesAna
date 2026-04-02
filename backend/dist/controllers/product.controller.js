import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, createVariant, updateVariant, deleteVariant, } from '../services/product.service.js';
export async function getProductsController(_req, res, next) {
    try {
        const products = await getAllProducts();
        res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getProductController(req, res, next) {
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
    }
    catch (error) {
        next(error);
    }
}
export async function createProductController(req, res, next) {
    try {
        const { name, description, categoryId, imageUrl } = req.body;
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
        const categoryIdNumber = categoryId ? Number(categoryId) : undefined;
        if (categoryId && isNaN(categoryIdNumber)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid categoryId',
                },
            });
            return;
        }
        const product = await createProduct({
            name: name.trim(),
            description,
            categoryId: categoryIdNumber,
            imageUrl,
        });
        res.status(201).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
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
        }
        next(error);
    }
}
export async function updateProductController(req, res, next) {
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
        const { name, description, categoryId, imageUrl } = req.body;
        const updateData = {};
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
        if (description !== undefined)
            updateData.description = description;
        if (categoryId !== undefined) {
            if (categoryId === null) {
            }
            else {
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
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        const product = await updateProduct(id, updateData);
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
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
        }
        next(error);
    }
}
export async function deleteProductController(req, res, next) {
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
        await deleteProduct(id);
        res.status(204).send();
    }
    catch (error) {
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
export async function createVariantController(req, res, next) {
    try {
        const productIdParam = req.params.id;
        if (!productIdParam || typeof productIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid product ID parameter',
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
                    message: 'Invalid product ID',
                },
            });
            return;
        }
        const { name, sku, price, stock } = req.body;
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
        if (price === undefined || stock === undefined) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Price and stock are required',
                },
            });
            return;
        }
        const priceNumber = Number(price);
        const stockNumber = Number(stock);
        if (isNaN(priceNumber) || isNaN(stockNumber)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Price and stock must be valid numbers',
                },
            });
            return;
        }
        const variant = await createVariant({
            productId,
            name: name.trim(),
            sku,
            price: priceNumber,
            stock: stockNumber,
        });
        res.status(201).json({
            success: true,
            data: variant,
        });
    }
    catch (error) {
        if (error instanceof Error) {
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
            if (error.message === 'PRODUCT_NOT_FOUND') {
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
export async function updateVariantController(req, res, next) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid variant ID parameter',
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
                    message: 'Invalid variant ID',
                },
            });
            return;
        }
        const { name, sku, price, stock } = req.body;
        const updateData = {};
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
        if (sku !== undefined)
            updateData.sku = sku;
        if (price !== undefined) {
            const priceNumber = Number(price);
            if (isNaN(priceNumber)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Price must be a valid number',
                    },
                });
                return;
            }
            updateData.price = priceNumber;
        }
        if (stock !== undefined) {
            const stockNumber = Number(stock);
            if (isNaN(stockNumber)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Stock must be a valid number',
                    },
                });
                return;
            }
            updateData.stock = stockNumber;
        }
        const variant = await updateVariant(id, updateData);
        res.status(200).json({
            success: true,
            data: variant,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Variant not found',
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
export async function deleteVariantController(req, res, next) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid variant ID parameter',
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
                    message: 'Invalid variant ID',
                },
            });
            return;
        }
        await deleteVariant(id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Variant not found',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
//# sourceMappingURL=product.controller.js.map
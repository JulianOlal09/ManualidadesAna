import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, toggleCategoryActive, } from '../services/category.service.js';
export async function getCategoriesController(_req, res, next) {
    try {
        const categories = await getAllCategories();
        res.status(200).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getCategoryController(req, res, next) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID parameter',
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
                    message: 'Invalid category ID',
                },
            });
            return;
        }
        const category = await getCategoryById(id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found',
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function createCategoryController(req, res, next) {
    try {
        const { name, description, parentId } = req.body;
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
        const trimmedName = name.trim();
        if (parentId !== undefined && parentId !== null) {
            const parentIdNumber = Number(parentId);
            if (isNaN(parentIdNumber)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid parentId',
                    },
                });
                return;
            }
        }
        const category = await createCategory({
            name: trimmedName,
            description,
            parentId: parentId ? Number(parentId) : undefined,
        });
        res.status(201).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'CATEGORY_ALREADY_EXISTS') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_ALREADY_EXISTS',
                        message: 'Category name already exists',
                    },
                });
                return;
            }
            if (error.message === 'PARENT_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'PARENT_NOT_FOUND',
                        message: 'Parent category not found',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function updateCategoryController(req, res, next) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID parameter',
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
                    message: 'Invalid category ID',
                },
            });
            return;
        }
        const { name, description, parentId } = req.body;
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
        if (parentId !== undefined) {
            const parentIdNumber = Number(parentId);
            if (isNaN(parentIdNumber)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid parentId',
                    },
                });
                return;
            }
            updateData.parentId = parentIdNumber;
        }
        const category = await updateCategory(id, updateData);
        res.status(200).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Category not found',
                    },
                });
                return;
            }
            if (error.message === 'CATEGORY_ALREADY_EXISTS') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_ALREADY_EXISTS',
                        message: 'Category name already exists',
                    },
                });
                return;
            }
            if (error.message === 'PARENT_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'PARENT_NOT_FOUND',
                        message: 'Parent category not found',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function deleteCategoryController(req, res, next) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID parameter',
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
                    message: 'Invalid category ID',
                },
            });
            return;
        }
        await deleteCategory(id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Category not found',
                    },
                });
                return;
            }
            if (error.message === 'CATEGORY_HAS_PRODUCTS') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_HAS_PRODUCTS',
                        message: 'Cannot delete category with active products',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function toggleCategoryActiveController(req, res, next) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid category ID parameter',
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
                    message: 'Invalid category ID',
                },
            });
            return;
        }
        const category = await toggleCategoryActive(id);
        res.status(200).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Category not found',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
//# sourceMappingURL=category.controller.js.map
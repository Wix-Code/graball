import prisma from "@/config/prismaConnect";
import jwt from "jsonwebtoken";
// Authentication middleware - verifies JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({ error: "Access token required" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
// Role-based authorization middleware
export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Access denied. Insufficient permissions.",
                required: allowedRoles,
                current: req.user.role
            });
        }
        next();
    };
};
// Specific role middlewares for convenience
export const requireAdmin = authorize(['ADMIN']);
export const requireVendor = authorize(['VENDOR', 'ADMIN']);
export const requireCustomer = authorize(['CUSTOMER', 'VENDOR', 'ADMIN']);
export const requireVendorOnly = authorize(['VENDOR']);
export const requireCustomerOnly = authorize(['CUSTOMER']);
// Resource ownership middleware (for vendors accessing their own stores/products)
export const requireOwnership = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Admin can access everything
        if (req.user.role === 'ADMIN') {
            return next();
        }
        const { storeId, productId } = req.params;
        // Check store ownership
        if (storeId) {
            const store = await prisma.store.findUnique({
                where: { id: parseInt(storeId) }
            });
            if (!store || store.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Access denied. You don't own this resource." });
            }
        }
        // Check product ownership through store
        if (productId && !storeId) {
            const product = await prisma.product.findUnique({
                where: { id: parseInt(productId) },
                include: { store: true }
            });
            if (!product || product.store.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Access denied. You don't own this resource." });
            }
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
// Permission checker utility
export const checkPermissions = (userRole, resource, action) => {
    const permissions = {
        ADMIN: {
            users: ['create', 'read', 'update', 'delete'],
            stores: ['create', 'read', 'update', 'delete'],
            products: ['create', 'read', 'update', 'delete'],
            categories: ['create', 'read', 'update', 'delete'],
            orders: ['create', 'read', 'update', 'delete']
        },
        VENDOR: {
            users: ['read'], // only their own profile
            stores: ['create', 'read', 'update', 'delete'], // only their own stores
            products: ['create', 'read', 'update', 'delete'], // only their own products
            categories: ['read'],
            orders: ['read', 'update'] // orders for their products
        },
        CUSTOMER: {
            users: ['read', 'update'], // only their own profile
            stores: ['read'],
            products: ['read'],
            categories: ['read'],
            orders: ['create', 'read'] // only their own orders
        }
    };
    const rolePermissions = permissions[userRole];
    if (!rolePermissions)
        return false;
    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions)
        return false;
    return resourcePermissions.includes(action);
};
// Dynamic permission middleware
export const requirePermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!checkPermissions(req.user.role, resource, action)) {
            return res.status(403).json({
                error: `Access denied. ${req.user.role} cannot ${action} ${resource}`
            });
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map
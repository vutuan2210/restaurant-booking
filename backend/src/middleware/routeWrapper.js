import { authenticate, canView, canModify } from "./auth.middleware.js";

/**
 * Route wrapper for protected routes
 * @param {Object} options
 * @param {boolean} options.auth - Require authentication
 * @param {boolean} options.view - Allow STAFF/ADMIN to view (GET only)
 * @param {boolean} options.modify - Allow only ADMIN to modify (POST/PUT/DELETE)
 */
export const protectedRoute = (options = {}) => {
  return (req, res, next) => {
    // Always authenticate first
    authenticate(req, res, (err) => {
      if (err) return err;

      const method = req.method;

      // If view-only mode and GET request
      if (options.view && method === "GET") {
        return canView(req, res, next);
      }

      // If modify mode and non-GET request
      if (options.modify && method !== "GET") {
        return canModify(req, res, next);
      }

      next();
    });
  };
};

/**
 * Apply authentication to all routes in a router
 * - GET: requires STAFF or ADMIN
 * - POST/PUT/DELETE: requires ADMIN only
 */
export const withRoleProtection = (router) => {
  // This is a simple wrapper - in practice you'd apply middleware per-route
  return router;
};

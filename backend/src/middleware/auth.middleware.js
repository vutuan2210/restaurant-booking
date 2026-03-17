import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "restaurant_secret_key";

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role '${req.user.role}' not authorized. Required: ${roles.join(" or ")}` 
      });
    }

    next();
  };
};

/**
 * Admin or Staff can access GET routes
 */
export const canView = authorize("ADMIN", "STAFF");

/**
 * Only Admin can modify data
 */
export const canModify = authorize("ADMIN");

/**
 * Middleware to filter data by user's restaurant
 * Use this after authenticate to add restaurant filter to query
 */
export const filterByRestaurant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // ADMIN can see all restaurants
  if (req.user.role === "ADMIN") {
    req.restaurantFilter = {};
  }
  // STAFF can only see their restaurant
  else if (req.user.restaurant) {
    req.restaurantFilter = { restaurant: req.user.restaurant };
  } else {
    return res.status(403).json({ message: "No restaurant assigned" });
  }

  next();
};

export { JWT_SECRET };

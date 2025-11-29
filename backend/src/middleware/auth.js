import jwt from "jsonwebtoken";

export function authGuard(requiredRoles = [], options = {}) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // If optional auth and no token, skip authentication
    if (options.optional && (!authHeader || !authHeader.startsWith("Bearer "))) {
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
      
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      next();
    } catch (err) {
      // If optional auth and invalid token, skip authentication
      if (options.optional) {
        return next();
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

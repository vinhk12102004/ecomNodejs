import { randomUUID } from "crypto";

/**
 * Middleware to handle guest token for anonymous cart
 * Reads x-guest-token header or generates a new one
 */
export function guestToken(req, res, next) {
  // If user is authenticated, skip guest token
  if (req.user?.id) {
    return next();
  }

  // Read existing guest token from header
  let token = req.headers['x-guest-token'];

  // If no token, generate a new UUID
  if (!token) {
    token = randomUUID();
  }

  // Attach token to request for use in controllers
  req.guestToken = token;

  // Send token back to client in response header
  res.setHeader('x-guest-token', token);

  next();
}


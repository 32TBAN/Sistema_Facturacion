import { verifyAccessToken } from "../lib/jwt";
import { HttpError } from "../utils/httpError";

export const requireAuth = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new HttpError(401, "Missing or invalid authorization header"));
    }

    const payload = verifyAccessToken(token);
    req.auth = {
      userId: Number(payload.sub),
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch (_error) {
    next(new HttpError(401, "Invalid or expired token"));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.auth) {
    return next(new HttpError(401, "Unauthorized"));
  }
  if (!roles.includes(req.auth.role)) {
    return next(new HttpError(403, "Insufficient role"));
  }
  next();
};

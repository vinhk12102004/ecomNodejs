// middleware kiểm tra quyền admin
export default function requireAdmin(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

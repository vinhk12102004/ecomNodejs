import User from "../../models/user.model.js";
import { getPaging } from "../../services/paging.util.js";

export async function list(req, res) {
  try {
    const { page, limit, skip } = getPaging(req);
    const total = await User.countDocuments();
    const data = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ page, limit, total, pages: Math.ceil(total / limit), data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function update(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

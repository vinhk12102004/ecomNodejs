import bcrypt from "bcrypt";
import User from "../models/user.model.js";

/**
 * PATCH /me
 * Update current user profile (name, password)
 * Body: { name?, oldPassword?, newPassword? }
 */
export async function updateProfile(req, res) {
  try {
    const { name, oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ==== UPDATE NAME ====
    if (name !== undefined) {
      user.name = name.trim();
    }

    // ==== UPDATE PASSWORD ====
    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error: "oldPassword and newPassword are required"
        });
      }

      // Check old password
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const jsonUser = user.toJSON();
    delete jsonUser.password;

    res.json(jsonUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /me/addresses
 * List all addresses for current user
 */
export async function listAddresses(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ addresses: user.addresses || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /me/addresses
 * Create new address
 */
export async function createAddress(req, res) {
  try {
    const { label, recipient, phone, line1, line2, city, district, ward } = req.body;

    if (!label || !recipient || !phone || !line1 || !city) {
      return res.status(400).json({
        error: "label, recipient, phone, line1, and city are required"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isFirstAddress = !user.addresses || user.addresses.length === 0;
    const isDefault = isFirstAddress;

    // If setting as default, unset others
    if (isDefault && user.addresses && user.addresses.length > 0) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    const newAddress = {
      label,
      recipient,
      phone,
      line1,
      line2: line2 || "",
      city,
      district: district || "",
      ward: ward || "",
      isDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    const addedAddress = user.addresses[user.addresses.length - 1];
    res.status(201).json({ address: addedAddress });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /me/addresses/:addrId
 */
export async function updateAddress(req, res) {
  try {
    const { addrId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = user.addresses.id(addrId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== "isDefault" && key !== "_id") {
        address[key] = updates[key];
      }
    });

    await user.save();
    res.json({ address });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /me/addresses/:addrId
 */
export async function deleteAddress(req, res) {
  try {
    const { addrId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = user.addresses.id(addrId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    address.deleteOne();
    await user.save();

    res.json({ message: "Address deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /me/addresses/:addrId/default
 */
export async function setDefaultAddress(req, res) {
  try {
    const { addrId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = user.addresses.id(addrId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addrId;
    });

    await user.save();
    res.json({ address });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import User from "../models/user.model.js";

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
 * Body: { label, recipient, phone, line1, line2?, city, district?, ward? }
 */
export async function createAddress(req, res) {
  try {
    const { label, recipient, phone, line1, line2, city, district, ward } = req.body;
    
    if (!label || !recipient || !phone || !line1 || !city) {
      return res.status(400).json({ error: "label, recipient, phone, line1, and city are required" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // If this is the first address, set it as default
    const isFirstAddress = !user.addresses || user.addresses.length === 0;
    const isDefault = isFirstAddress;
    
    // If setting as default, unset other defaults
    if (isDefault && user.addresses && user.addresses.length > 0) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
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
 * Update address
 * Body: { label?, recipient?, phone?, line1?, line2?, city?, district?, ward? }
 */
export async function updateAddress(req, res) {
  try {
    const { addrId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const address = user.addresses.id(addrId);
    if (!address) return res.status(404).json({ error: "Address not found" });
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'isDefault' && key !== '_id') {
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
 * Delete address
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
 * Set address as default (unset others)
 */
export async function setDefaultAddress(req, res) {
  try {
    const { addrId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const address = user.addresses.id(addrId);
    if (!address) return res.status(404).json({ error: "Address not found" });
    
    // Unset all other defaults
    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addrId;
    });
    
    await user.save();
    
    res.json({ address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


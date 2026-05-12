import { Ad } from "../models/Ad.js";
import { clearCache } from "../utils/cache.js";

export const getAds = async (req, res) => {
  try {
    const { position, onlyActive } = req.query;
    const where = {};
    if (position) where.position = position;
    if (onlyActive === "true") where.isActive = true;

    const ads = await Ad.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAd = async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    await clearCache("ads");
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });
    
    await ad.update(req.body);
    await clearCache("ads");
    res.json({ success: true, data: ad });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });
    
    await ad.destroy();
    await clearCache("ads");
    res.json({ success: true, message: "Ad deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackClick = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });
    
    await ad.increment('clickCount');
    res.json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

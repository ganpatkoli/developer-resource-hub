import { Settings } from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    const updateData = {};
    if (req.body.tabs !== undefined) {
      updateData.tabs = { ...settings.tabs, ...req.body.tabs };
    }
    if (req.body.customSections !== undefined) {
      updateData.customSections = req.body.customSections;
    }
    if (req.body.security !== undefined) {
      updateData.security = { ...settings.security, ...req.body.security };
    }
    
    await settings.update(updateData);
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

import Reservation from "../models/reservation.model.js";

/**
 * Cập nhật menu items sau checkin
 */
export const updateMenuItems = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation)
      return res.status(404).json({ message: "Not found" });

    if (reservation.status !== "CHECKED_IN") {
      return res.status(400).json({ message: "Can only update menu for checked-in reservation" });
    }

    const { menuItems } = req.body;
    
    // Validate menu items
    if (!menuItems || !Array.isArray(menuItems)) {
      return res.status(400).json({ message: "menuItems must be an array" });
    }

    // Update menu items
    reservation.menuItems = menuItems;
    await reservation.save();

    const updatedReservation = await Reservation.findById(req.params.id)
      .populate("tables")
      .populate("menuItems.menuItem");

    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

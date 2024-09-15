import express from "express";
import { deleteUserById, getAllUser } from "./adminApi.js";

const adminRoute = express.Router();

adminRoute.get("/api/users", async (req, res) => {
  try {
    const users = await getAllUser();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

adminRoute.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteUserById(id);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

export default adminRoute;

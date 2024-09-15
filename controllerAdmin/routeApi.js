import express from "express";
import { deleteUserById, getAllUser } from "./adminApi.js";
import "dotenv/config";
import { pool } from "../config/mysqlConfig.js";
import jwt from "jsonwebtoken";
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

adminRoute.post("/api/login", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT u.idUser, u.name, r.name , u.Role_idRole
      FROM user u
      JOIN role r ON u.Role_idRole = r.idRole
      WHERE u.name = ?
    `,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];
    console.log(user);
    if (user.name !== "ROLE_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const token = jwt.sign(
      { userId: user.idUser, username: user.name },
      "6d9524cf-6eca-4442-af68-fe0b934c49a7",
      {
        expiresIn: "3h",
      }
    );
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default adminRoute;

import express from "express";
import { deleteUserById, getAllUser } from "./adminApi.js";
import "dotenv/config";
import { pool } from "../config/mysqlConfig.js";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { get } from "mongoose";
import { countAcceessCount, getAccessStatistics } from "./Statistics.js";

//chart data of the liveblock

async function fetchStorageData(roomId) {
  try {
    console.log(process.env.API_KEY_LIVE);
    const response = await fetch(
      `https://api.liveblocks.io/v2/rooms/${roomId}/storage`,
      { headers: { Authorization: `Bearer ${process.env.API_KEY_LIVE}` } }
    );
    console.log(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

function getObjectSizeInBytes(obj) {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
}

function getTotalSizeInBytes(canvasObjects) {
  let totalSize = 0;

  Object.values(canvasObjects).forEach((value) => {
    totalSize += getObjectSizeInBytes(value);
  });

  return totalSize;
}

function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

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
      await User.findByIdAndDelete(id);
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

adminRoute.get("/api/users/filter", async (req, res) => {
  const { type } = req.query;

  try {
    let query = "";
    if (type === "week") {
      query = `
        SELECT * FROM user
        WHERE YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)
      `;
    } else if (type === "month") {
      query = `
        SELECT MONTH(createdAt) AS month, COUNT(*) AS user_count
        FROM user
        WHERE YEAR(createdAt) = YEAR(CURDATE())
        GROUP BY MONTH(createdAt)
        ORDER BY MONTH(createdAt);
      `;
    } else {
      return res.status(400).json({ message: "Invalid filter type" });
    }

    const [users] = await pool.query(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// project

adminRoute.get("/api/projects", async (req, res) => {
  try {
    const [projects] = await pool.query("SELECT * FROM project");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
});

adminRoute.get("/api/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM project WHERE idProject = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ message: "Error fetching project details" });
  }
});

adminRoute.get("/api/storage-size/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const data = await fetchStorageData(projectId);
    if (data && data.data.canvasObjects.data) {
      const totalSizeBytes = getTotalSizeInBytes(data.data.canvasObjects.data);
      res.json({ totalSize: bytesToSize(totalSizeBytes) });
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching storage data" });
  }
});

adminRoute.delete("/api/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM project WHERE idProject = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Project deleted successfully" });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
});

adminRoute.get("/notifications", async (req, res) => {
  const sql = "SELECT * FROM notification";
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

adminRoute.get("/notifications/:id", async (req, res) => {
  const sql = `
    SELECT n.*, ur.name AS userRequestUsername, ut.name AS userTankerUsername
    FROM notification n
    JOIN user ur ON n.user_idUser_taker = ur.idUser
    JOIN user ut ON n.user_idUser_requested = ut.idUser
    WHERE n.idNotification = ?
  `;

  try {
    const [results] = await pool.query(sql, [req.params.id]); // Use await and destructure
    if (results.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

adminRoute.delete("/notifications/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await pool.query("DELETE FROM notification WHERE idNotification = ?", [id]);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});

adminRoute.route("/access-statistics").get(async (req, res) => {
  try {
    const [results] = await pool.query(getAccessStatistics);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching access statistics:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

adminRoute.route("/amount-access-statistics").get(async (req, res) => {
  try {
    const [results] = await pool.query(countAcceessCount);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching access statistics:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

adminRoute.get("/invitations", async (req, res) => {
  const sql = "SELECT * FROM invitation";
  try {
    const [results] = await pool.query(sql); // Use await here and destructure the result
    res.json(results);
  } catch (error) {
    console.log(error);
  }
});

adminRoute.get("/invitations/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const sql = `
  SELECT n.*, ur.name AS userRequestUsername, ut.name AS userTankerUsername
  FROM invitation n
  JOIN user ur ON n.User_idUser_requested = ur.idUser   
  JOIN user ut ON n.User_idUser_invited = ut.idUser       
  WHERE n.idInvitation = ?;
  `;
  try {
    const [results] = await pool.query(sql, [id]); // Use await here and destructure the result
    if (results.length === 0) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    res.json(results[0]);
  } catch (error) {
    console.log(error);
  }
});

adminRoute.delete("/invitations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM invitation WHERE idInvitation = ?", [id]);
    res.status(200).json({ message: "Invitation deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});

export default adminRoute;

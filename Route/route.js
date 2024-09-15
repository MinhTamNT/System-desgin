import express from "express";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const route = express.Router();

route.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

route.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "user.html"));
});

route.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "login.html"));
});

export default route;

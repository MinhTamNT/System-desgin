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

route.get("/admin/project", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "project.html"));
});

route.get("/admin/project/project-details", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "project-detail.html"));
});

route.get("/admin/notification", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "notification.html"));
});

route.get("/admin/invite", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "inviation.html"));
});

export default route;

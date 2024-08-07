import mysql from "mysql2"; // Sử dụng mysql2
const configMySql = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export { configMySql };

import mysql from "mysql2";
const configMySql = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

const ExecuteStore = async (procedureName, params = []) => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const placeholders = params.map(() => "?").join(", ");
    const query = `CALL ${procedureName}(${placeholders})`;
    console.log(query);

    const [results] = await connection.query(query, params);

    await connection.commit();

    return results;
  } catch (error) {
    if (connection) await connection.rollback();

    console.error(`Execute ${procedureName} error:`, error.message);
    throw new Error(error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { configMySql, pool, ExecuteStore };

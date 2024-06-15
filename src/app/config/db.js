// import mysql from "mysql2/promise";

// export async function query({ query, values = [] }) {

//   const dbconnection = await mysql.createConnection({
//     host: "127.0.0.1",
//     port: "3306",
//     database: "Digital_Solution",
//     user: "root",
//     password: "",
//   });

//   try {
//     const [results] = await dbconnection.execute(query, values);
//     dbconnection.end();
//     console.log("Connected to Database");
//     return results;
//   } catch (error) {
//     throw Error(error.message);
//     console.error("Error connecting to MySQL Database: ",err);
//     return { error };
//   }
// }


import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: '3306',
  database: 'Digital_Solution',
  user: 'root',
  password: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql, values = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool after query completes
    }
  }
}

const mysql = require('mysql2');

// create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       
  password: 'alifaisal123@', 
  database: 'greenkeyper'
});

module.exports = pool.promise();

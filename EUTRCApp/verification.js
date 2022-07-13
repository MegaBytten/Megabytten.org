//   This .js file is used to establish a connection to our local MySQL database
//    It returns the connection object when called

let mysql = require('mysql');
require("dotenv").config();

let connection = mysql.createConnection({
    host: process.env.mySQLHost,
    user: process.env.mySQLUser,
    password: process.env.mySQLPass,
    database: process.env.mySQLDatabase
});

console.log('Exporting "MySQL Connection + Pool" - - -');
module.exports = {
  connection, pool
}

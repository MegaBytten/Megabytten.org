//   This .js file is used to establish a connection to our local MySQL database
//    It returns the connection object when called

let mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin1',
    password: 'Crebu0tusayAmed$-vetasAfiq*tax!dref5wrawrasa7epoRed',
    database: 'exeter_touch_app'
});

//creates a pool that allows up to 5 mysql connections at once
var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'admin1',
    password: 'Crebu0tusayAmed$-vetasAfiq*tax!dref5wrawrasa7epoRed',
    database: 'exeter_touch_app'
});

console.log('Exporting "MySQL Connection + Pool" - - -');
module.exports = {
  connection, pool
}

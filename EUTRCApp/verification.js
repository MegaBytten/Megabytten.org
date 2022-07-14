//   This .js file is used to establish a connection to our local MySQL database
//    It returns the password of the user
let mysql = require('mysql2');
let userEmail = require('../app.js');
require("dotenv").config();

let userPass = null;

let connection = mysql.createConnection({
    host: process.env.mySQLHost,
    user: process.env.mySQLUser,
    password: process.env.mySQLPass,
    database: process.env.mySQLDatabase
});

//pull MySQL Data - if user is verified do:
//if user has been sent verification email ask to confirm resend
//if user has successfully been sent first time verif, congrats!
console.log('Attempting MYSQL Connection!');
connection.connect(function(err) {
  if (err) throw err;
  console.log('Successfully connected to MySQL Database!');
  console.log('userEmail = ' + userEmail.userEmail);
  //do mysql stuff
  const query = "SELECT password FROM users where email = '"
    + userEmail + "';";
  connection.query(query, function (err, result, fields) {
    if (err) throw err;
    console.log('User password = ' + result);
    userPass = result;
    console.log('Successfully Exported MySQL Result!');
    module.exports = {
      userPass
    }
  });
});

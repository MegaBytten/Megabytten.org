//   This .js file is used to establish a connection to our local MySQL database
//    It returns the password of the user
let mysql = require('mysql2');
let userEmail = require('../app.js');
require("dotenv").config();


function getMySQLConnection(){
  console.log('Verification.js: creating connection');
  let connection = mysql.createConnection({
      host: process.env.mySQLHost,
      user: process.env.mySQLUser,
      password: process.env.mySQLPass,
      database: process.env.mySQLDatabase
  });
  return connection;
}

function getMySQLPassword(connection, userEmail){
  //pull MySQL Data - if user is verified do:
  //if user has been sent verification email ask to confirm resend
  //if user has successfully been sent first time verif, congrats!
  console.log('Attempting MYSQL Connection!');
  connection.connect(function(err) {
    if (err) throw err;
    console.log('Successfully connected to MySQL Database!');
    console.log('userEmail = ' + userEmail);
    //do mysql stuff
    const query = "SELECT password FROM users where email = '"
      + userEmail + "';";
    connection.query(query, function (err, result, fields) {
      if (err){
        throw err;
        return null;
      }
      console.log('User password = ' + result);
      console.log('Successfully Exported MySQL Result!');
      return result;
    });
  });
}
//export functions to be used elsewhere
module.exports = { getMySQLConnection, getMySQLPassword };

//   This .js file is used to establish a connection to our local MySQL database
//    It returns the password of the user
let mysql = require('mysql2');
require("dotenv").config();
let dirName = null;

function getUserPass(userEmail, userPass, res, direcName){
  dirName = direcName;
  let connection = mysql.createConnection({
      host: process.env.mySQLHost,
      user: process.env.mySQLUser,
      password: process.env.mySQLPass,
      database: process.env.mySQLDatabase
  });

  console.log('Verification.js: Attempting MySQL Connection');
  connection.connect((err) => {
    //this function never gets called! Never any 'success' log
    if (err) {
      return error;
    } else {
      console.log('Successfully connected to MySQL Database!');
      getPassword(connection, userEmail, userPass, res);
    }
  });
}

function getPassword(connection, userEmail, userPass, res){
  console.log('Attempting User Password Retrieval');
  console.log('userEmail = ' + userEmail);
  const query = "SELECT password FROM users WHERE email = '"
    + userEmail + "';";

  connection.query(query, function (err, result, fields) {
    if (err){
      console.log(error);
      throw err;
    } else {
      console.log('User password = ' + result);
      if (result == null) {
        console.log('Result = null!');
      } else {
          console.log("Received User's Pass from SQL: " + result + " and userPass from form: " + userPass);
          if (result == null){
        // User was not found in database, or incorrect email address provided.
            console.log("User's pass returned null. (No User in database or Password retrieval error.)");
            res.sendFile('/EUTRCApp/verification-failure.html', dirName);
          } else if (result == userPass){
        // Password matches continue to verification emailBot
          verify.pythonBot(userEmail);
          res.sendFile('/EUTRCApp/verification-success.html', dirName);
          } else {
        // passwords do not match
            console.log("User's pass does not match MySQL!");
            res.sendFile('/EUTRCApp/verification-failure.html', dirName);
          }
        }
    }
  });
}



function pythonBot(userEmail){
  /*
  Launches Python bot and passes arguments via command line
  */
  const emailBotSender = process.env.emailBotSender;
  const emailBotPass = process.env.emailBotPass;

  const spawn = require("child_process").spawn;
  const childPython = spawn(
    'py',
    ['/verfbot.py', emailBotSender, emailBotPass, userEmail],
    {shell: true}
  );

  childPython.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  childPython.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  childPython.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}


//export functions to be used elsewhere
module.exports = { getUserPass, pythonBot };

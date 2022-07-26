//   This .js file is used to establish a connection to our local MySQL database
//    It returns the password of the user
let mysql = require('mysql2/promise');
require("dotenv").config();

async function getUserPass(userEmail){
  const connection = await mysql.createConnection({
      host: process.env.mySQLHost,
      user: process.env.mySQLUser,
      password: process.env.mySQLPass,
      database: process.env.mySQLDatabase
  });

  console.log('Attempting User Password Retrieval');
  console.log('userEmail = ' + userEmail);
  const query = "SELECT password FROM users WHERE email = '"
    + userEmail + "';";

  const result = await connection.query(query);
  // console.log(result);
  // console.table(result[0]);
  //result returns 2 arrays, first is the actual result and second is the schema info

  console.log('User password = ' + result[0]);
  return result[0];
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
    ['./EUTRCApp/verfbot.py', emailBotSender, emailBotPass, userEmail],
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

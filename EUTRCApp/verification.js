//   This .js file is used to establish a connection to our local MySQL database
//    It returns the password of the user
let mysql = require('mysql2/promise');
require("dotenv").config();

async function queryMySQL(query){
  const connection = await mysql.createConnection({
      host: process.env.mySQLHost,
      user: process.env.mySQLUser,
      password: process.env.mySQLPass,
      database: process.env.mySQLDatabase
  });

  console.log('MySQL Connection Established. Attempting Query: ' + query);
  const result = await connection.query(query);
  // console.log(result);
  // console.table(result[0]);
  //result returns 2 arrays, first is the actual result and second is the schema info
  console.log('Result[0] = ' + result[0]);
  return result[0];
}


async function generateVerifCode(){
  console.log('Generating EUTRCApp Verification Code.');
  const crypto = require("crypto");

  // Asynchronous
  crypto.randomInt(0, 10000000000, (err, n) => { //generates randomInt from 1-9,999,999,999
    if (err) throw err;
    return n;
  });
}

async function saveVerifCode(code, userEmail){
  console.log('Saving User Verification Code: ' + code + ' to MySQL.');
  const query = "update users set verification_code = " + code
    + " where email = " + userEmail + ";";
console.log( "Save Verif Code Status: " + queryMySQL(query) );

}



function pythonBot(userEmail){
  /*
  Launches Python bot and passes arguments via command line
  */
  const emailBotSender = process.env.emailBotSender;
  const emailBotPass = process.env.emailBotPass;
  const verifCode = await generateVerifCode();
  await saveVerifCode(verifCode, userEmail);

  const spawn = require("child_process").spawn;
  const childPython = spawn(
    'py',
    ['./EUTRCApp/verfbot.py', emailBotSender, emailBotPass, userEmail, verifCode],
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

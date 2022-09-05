//   This .js file is used to establish a connection to our local MySQL database
//    It returns the password of the user
let mysql = require('mysql2/promise');
require("dotenv").config();


var connection;
async function getConnection(){
  if (connection != null){
    return connection;
  } else {
    connection = await mysql.createConnection({
        host: process.env.mySQLHost,
        user: process.env.mySQLUser,
        password: process.env.mySQLPass,
        database: process.env.mySQLDatabase
    });
  }
  return connection;
}


/*
  This function is the most widely used in my entire website
  Handles all my SQL queries by taking in the Query as a string
  Returns a null object if the SQL query was unable to find a result (eg. [undefined])
  Therefore, whenever a SQL query MAY return null, code must call this queryHandler
  and perform a null check.
*/
async function queryMySQL(query){
  let connection = await getConnection();
  const result = await connection.query(query)

  // this null check checks to see if SQL Results [0] have any items, or if it is empty.
  if (result[0].length == 0){
    console.log("Result[0].length == 0, no SQL result.");
    return null;
  }

  // console.table(result[0]);
  //result returns 2 arrays, first is the actual result and second is the schema info
  console.log('Result[0] = ' + JSON.stringify(result[0]));

  return result[0];
}


/*
MySQL Servers have a timeout property which close a silent SQL connection after some time
By calling this 
*/
async function pingConnection(){
  let sleepMs = 1_000; //1_000_000 ms =1,000 seconds ~=15 mins 
  let con = getConnection();
  
  while (true){
    console.log("Pinging SQL Server.");
    con.ping((err)=>{
      if (err) console.log("SQL server unpingable.");
      else console.log("Pong.");
    });
    await new Promise(r=> setTimeout(r, 10000))
  }
}


function generateVerifCode(){
  console.log('Generating EUTRCApp Verification Code.');
  const crypto = require("crypto");

  const n = crypto.randomInt(0, 1000000000); //generates 1-9,999,999,999
  console.log(n);
  return n;
}

async function saveVerifCode(code, userEmail){
  console.log('Saving User Verification Code: ' + code + ' to MySQL.');
  const query = 'update users set verification_code = ' + code
    + ' where email = "' + userEmail + '";';

  const verifStatus = await queryMySQL(query);
  console.log( "Save Verif Code Status: " + verifStatus );
}

async function pythonBot(userEmail){
  /*
  Launches Python bot and passes arguments via command line
  */
  const emailBotSender = process.env.emailBotSender;
  const emailBotPass = process.env.emailBotPass;
  const verifCode = generateVerifCode();
  saveVerifCode(verifCode, userEmail);

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
module.exports = { queryMySQL, pingConnection, pythonBot };

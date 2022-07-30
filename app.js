//dependencies - will run and establish once everytime server starts
const express = require('express');
const app = express();

//class variables
const dirName = { root: __dirname };

/*  ################################################################################
    ################################################################################
    ####################  Server Setup (Port Listening)  ###########################
    ################################################################################
    ################################################################################
*/
// TODO: set up ip/domain as process.env variable!!
app.listen(80, 'megabytten.org');

//middleware
app.use(express.urlencoded( {extended: true} ));





/*  ################################################################################
    ################################################################################
    #########################  Class-wide Functions  ###############################
    ################################################################################
    ################################################################################
*/

async function checkUserPassword(userEmail, userPass){
  console.log('async func checkUserPassword - checking user password.');
  const verify = require('./EUTRCApp/verification.js');

  const query = "SELECT password FROM users WHERE email = '"
    + userEmail + "';";
  let userSQLResult = await verify.queryMySQL(query);

  if (userSQLResult[0] == null) {
    // User was not found in database, or incorrect email address provided.
    console.log("User's pass returned null. (No User in database)");
    return 0;
  } else {
      let userSQLPass = userSQLResult[0]["password"];
      console.log("Received User's Pass from SQL: " + userSQLPass + " and userPass from form: " + userPass);
      if (userSQLPass == userPass){
        // Password matches continue to verification emailBot
        console.log("Passwords match. Logging " + userEmail + " in.");
      return 1;
      } else {
        // passwords do not match
        console.log("Passwords did not match.");
      return 2;
    }
  }
}




/*  ################################################################################
    ################################################################################
    ################  Handling Routes for Home Pages/resources  ####################
    ################################################################################
    ################################################################################
*/
app.get('/',  (req, res) => {
  res.sendFile('/Main/home.html', dirName);
});
app.get('/home', (req, res) => {
  res.sendFile('/Main/home.html', dirName);
});



/*  ################################################################################
    ################################################################################
    ###############  Handling Routes for EUTRC Pages/resources #####################
    ################################################################################
    ################################################################################
*/
app.get('/eutrcapp', (req, res) => {
  res.sendFile('/eutrcapp/main.html', dirName);
});

//link used by EUTRCApp to check verification code and verify user
app.post('/eutrcapp/verify', async (req, res) => {
  console.log('/eutrcapp/signup/verify reached! User ' + req.body.email);
  const userEmail = req.body.email;
  const verifCode = req.body.verifCode;

  const verify = require('./EUTRCApp/verification.js');
  let query = "SELECT verification_code FROM users WHERE email = '"
    + userEmail + "';";
  let userSQLResult = await verify.queryMySQL(query);
  let userSQLVerifCode = userSQLResult[0]["verification_code"];

  if (userSQLVerifCode == "null"){
    //verification code not found in database =
    //  1. no verification code sent
    //  2. no user registered
    // 3. user already verified and attempting to verify again
    console.log('userSQLVerifCode == null');
    res.status(999).end();

  } else if (verifCode == userSQLVerifCode){
    query = "UPDATE users SET verified = 1, verification_code = 'null' WHERE email = '"
    + userEmail + "';"
    let userSQLResult = await verify.queryMySQL(query);
    let sqlQueryStatus = userSQLResult[0];
    console.log("User: " + userEmail + " verified.");
    res.status(200).end();

  } else {
    //other error
    console.log("Verification codes do not match.");
    res.status(998).end();
  }
});

//Common link: Used by any source, sends an automated verification email after checkUserPassword()
app.post('/eutrcapp/verfbot', async (req, res) => {
  console.log('/eutrcapp/verfbot reached! User ' + req.body.email);
  const userEmail = req.body.email;
  const userPass = req.body.password;

  const loginSuccess = await checkUserPassword(userEmail, userPass);

  switch (loginSuccess) {
    case 0:
      //login was failure: User not recognised in DB
      res.status(999).sendFile('/EUTRCApp/verification-failure.html', dirName);
      break;
    case 1:
      //login was a success
      console.log("Launching verfbot.py for user: " + userEmail);
      const verify = require('./EUTRCApp/verification.js');
      verify.pythonBot(userEmail);
      res.status(200).sendFile('/EUTRCApp/verification-success.html', dirName);
      break;
    case 2:
      //login was failure: Passwords did not match
      res.status(998).sendFile('/EUTRCApp/verification-failure.html', dirName);
      break;
    default:
      //other error.
      console.log("Server Error (Code: 01)");
      res.status(500).send('Error (01)');
  }
});

//link used by EUTRCApp to sign up - add user to database!
app.post('/eutrcapp/signup', async (req, res) => {
  console.log('/eutrcapp/signup reached! User ' + req.body.email);

  const userEmail = req.body.email;
  const userFirstName = req.body.firstName;
  const userLastName = req.body.lastName;
  const userPhoneNumber = req.body.phoneNumber;
  const userPassword = req.body.password
  const userCoach = req.body.coach;

  const verify = require('./EUTRCApp/verification.js');

  //check if user already Exists
  //queries MySQL database for user's password
  let query = "SELECT * FROM users WHERE email = '"
    + userEmail + "';";
  let userSQLResult = await verify.queryMySQL(query);

  if (userSQLResult[0] == null){
    //user doesnt exist so adding to database

    if (userEmail.includes("@exeter.ac.uk")) {
      //email is confirmed @exeter.ac.uk
      query = "INSERT INTO users VALUES ('" + userEmail
        + "', '" + userFirstName
        + "', '" + userLastName
        + "', '" + userPhoneNumber
        + "', '" + userPassword
        + "', '0', 'null', "
        + userCoach + ");"

      let userSQLResult = await verify.queryMySQL(query);
      let sqlQueryResult = JSON.stringify(userSQLResult[0]);
      console.log("sqlQueryResult: " + sqlQueryResult + ". User added to DB!");

      res.status(200).send("added")
    } else {
      //email is not @exeter.ac.uk
      console.log("Non @exeter.ac.uk email posted! Sending error message");
      res.send("Invalid Email Address.")
    }

  } else {
    //user already exists!
    console.log("User Already exists in database! Sending error message");
    res.send("Exists")
  }
});

//link used to sign on on EUTRCApp or future website
app.post('/eutrcapp/login', async (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('/eutrcapp/login post received. Login in user: '+ userEmail + ' with password; ' + userPass);

  const loginSuccess = await checkUserPassword(userEmail, userPass);
  switch (loginSuccess) {
    case 0:
      //login was failure: User not recognised in DB
      res.status(999).send('Login error: User not found');
      break;
    case 1:
      //login was a success
      //// TODO: Future website/application requires an HTML response here, not just 2 words
      res.status(200).send('Login Success!');
      break;
    case 2:
      //login was failure: Passwords did not match
      res.status(998).send('Login error: Incorrect Password.');
      break;
    default:
      //other error.
      console.log("Server Error (Code: 01)");
      res.status(500).send('Error (01)');
  }

});

//link used to pull a user's info
app.post('/eutrcapp/user', async (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('/eutrcapp/user post received. Getting User info of user: '+ userEmail + ' with password; ' + userPass);

  const loginSuccess = await checkUserPassword(userEmail, userPass);

  switch (loginSuccess) {
    case 0:
      //login was failure: User not recognised in DB
      console.log("User's pass returned null. (No User in database or Password retrieval error.)");
      res.status(999).send('Login error: User not found');
      break;
    case 1:
      //login was a success, need to pull and send user data now
      const verify = require('./EUTRCApp/verification.js');
      let query = "SELECT * FROM users WHERE email = '"
        + userEmail + "';";
      let userSQLResult = await verify.queryMySQL(query);

      if (userSQLResult[0] == null){
        //no result, but no user in database bypassed checkUserPassword?
        console.log("Error (02)");
        res.status(500).send('Error (02)');
      } else {
        console.log('successfully logged in. Sending user details for user: ' + userEmail);
        let userSQL_first_name = userSQLResult[0]["first_name"];
        let userSQL_last_name = userSQLResult[0]["last_name"];
        let userSQL_phone_number = userSQLResult[0]["phone_number"];
        let userSQL_coach = false;
        if (userSQLResult[0]["coach"] == 1){ userSQL_coach = true; }

        let userInfo = userSQL_first_name + ';' + userSQL_last_name + ';' + userSQL_phone_number + ';' + userSQL_coach;
        res.status(200).send(userInfo);
      }
      break;
    case 2:
      //login was failure: Passwords did not match
      console.log("Passwords did not match!");
      res.status(998).send('Login error: Incorrect Password.');
      break;
    default:
      //other error.
      console.log("Server Error (Code: 01)");
      res.status(500).send('Error (01)');
  }
});

//link used to check a user's verification
app.post('/eutrcapp/checkverif', async (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('/eutrcapp/checkverif post received. Getting verification status of user: '+ userEmail + ' with password; ' + userPass);

  const loginSuccess = await checkUserPassword(userEmail, userPass);

  if (loginSuccess == 1){
    //login success!
    const verify = require('./EUTRCApp/verification.js');
    let query = "SELECT verified FROM users WHERE email = '"
      + userEmail + "';";
    let userSQLResult = await verify.queryMySQL(query);

    if (userSQLResult[0] == null){
      //no result, but no user in database bypassed checkUserPassword?
      console.log("Error (02)");
      res.status(500).send('Error (02)');
    } else {
      let userSQLVerif = userSQLResult[0]["verified"];
      //sending a 0 or 1 is interpreted as a status code from node = error
      //so need to send a "true" or "false" instead
      if (userSQLVerif == 1){ userSQLVerif = true; }
      else { userSQLVerif = false; }
      res.status(200).send(userSQLVerif);
    }

  } else {
    //login failure. App problem bc passed directly after sign in
    console.log("Error (03)");
    res.status(500).send('Error (03)');
  }
});

//link used to retrieve upcoming trainings
app.get('/eutrcapp/trainings.json', async (req, res) => {
  console.log("/eutrcapp/trainings reached! Getting weekly training schedule...");
  let resultsList = require('./EUTRCApp/get-next-training.js');
  resultsList = await resultsList.getNextTrainingsList();

  console.log("resultsList gotten! Next HP training: " + JSON.stringify(resultsList[0]));
  console.log("resultsList gotten! Next DV training: " + JSON.stringify(resultsList[1]));
  console.log("resultsList gotten! Next CB training: " + JSON.stringify(resultsList[2]));


  let jsonData = {hpTraining: resultsList[0], dvTraining: resultsList[1], cbTraining: resultsList[2]}
  console.log("Sending json object to client side: " + JSON.stringify(jsonData));

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(jsonData);
});





/*  ################################################################################
    ################################################################################
    ###############   Handling Routes for Obtaining Images   #######################
    ################################################################################
    ################################################################################
*/
app.get('/Main/imgs/mbproductionsbanner.png', (req, res) => {
  res.sendFile('/Main/imgs/mbproductionsbanner.png', dirName);
});



/*  ################################################################################
    ################################################################################
    ###########################   404 Handler    ###################################
    ################################################################################
    ################################################################################
*/
app.use( (req, res) => {
  res.status(404).sendFile('/Main/404.html', dirName);
});

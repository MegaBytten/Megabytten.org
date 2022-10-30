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
app.use(express.static('public'));
app.set('view engine', 'ejs');

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/favicon.ico'));

let sqlPing = require('./EUTRCApp/verification.js');
let pingTest = sqlPing.pingConnection();




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

  if (userSQLResult == null) {
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

async function checkUserVerif(userEmail, userPass){
  console.log(`async func checkUserVerif, checking user ${userEmail}`);
  const verify = require('./EUTRCApp/verification.js');
    let query =  `select verified from users where email = '${userEmail}';`
    let userSQLResult = await verify.queryMySQL(query);

    if (userSQLResult == null){
      //no result, but no user in database bypassed checkUserPassword?
      console.log("Error (02)");
      return null; //server error
    } else {
      let userSQLVerif = userSQLResult[0]["verified"];
      //sending a 0 or 1 is interpreted as a status code from node = error
      //so need to send a "true" or "false" instead
      if (userSQLVerif == 1){ return true; }
      else { return false; }
    }
}

async function launchVerfBot(userEmail){
  const verify = require('./EUTRCApp/verification.js');
  verify.pythonBot(userEmail);
}

async function checkUserAlreadyRSVP(userEmail, trainingTableName){
  const verify = require('./EUTRCApp/verification.js');

  //check if user has already RSVP'd
  let query = `select rsvp_yes from ${trainingTableName} where email = '${userEmail}';`
  let userSQLResult = await verify.queryMySQL(query);

  if (userSQLResult == null){
    //user has not rsvp'd previously to this training!
    console.log("userSQLResult == null, user Has not Rsvp'd previously!");
    return 'unanswered';
  }

  if (userSQLResult[0].rsvp_yes == 1){
    //rsvp_yes returned from training_ID = true! User has previously RSVP'd yes.
    console.log("userSQLResult[0].rsvp_yes == true, user previously RSVP'd yes!");
    return 'available';
  }

  query = `select rsvp_no from ${trainingTableName} where email = '${userEmail}';`
  userSQLResult = await verify.queryMySQL(query);
  if (userSQLResult[0].rsvp_no == 1){
    //rsvp_no returned from training_ID = true! User has previously RSVP'd no.
    console.log("userSQLResult[0].rsvp_no == true, user previously RSVP'd no!");
    return 'unavailable';
  }
  //user has not been found under EITHER rsvp_yes or rsvp_no
  console.log("None of above RSVP checks worked. Returning rsvp status: unanswered.");
  return 'unanswered';
}

async function getName(userEmail){
  const verify = require('./EUTRCApp/verification.js');
  const query = `SELECT first_name FROM users WHERE email = '${userEmail}';`
  let sqlResult = await verify.queryMySQL(query);
  return sqlResult[0]['first_name']
}

async function isCoach(userEmail){
  const verify = require('./EUTRCApp/verification.js');
  const query = `SELECT coach FROM users WHERE email = '${userEmail}';`
  let sqlResult = await verify.queryMySQL(query);
  if (sqlResult[0]['coach'] == 1){
    return true;
  } else {
    return false;
  }
}



/*  ################################################################################
    ################################################################################
    ################  Handling Routes for Home Pages/resources  ####################
    ################################################################################
    ################################################################################
*/
app.get('/', (req, res) => {
  res.sendFile('/public/home/home.html', dirName);
});
app.get('/home', (req, res) => {
  res.sendFile('/public/home/home.html', dirName);
});



/*  ################################################################################
    ################################################################################
    ###############  Handling Routes for EUTRC Pages/resources #####################
    ################################################################################
    ################################################################################
*/
//link for EUTRC home and about page
app.get('/eutrcapp', (req, res) => {
  console.log("/eutrcapp got! Sending HTML page.");
  res.sendFile('/public/eutrcapp/about.html', dirName);
});

//link used for privacy policy page
app.get('/eutrcapp/privacy-policy', (req, res) => {
  console.log("/eutrcapp/privacy-policy got! Sending HTML page.");
  res.sendFile('/public/eutrcapp/privacy-policy.html', dirName);
});

//link used by EUTRCApp to check verification code and verify user
app.post('/eutrcapp/verify', async (req, res) => {
  console.log('\n\n/eutrcapp/signup/verify reached! User ' + req.body.email);
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const verifCode = req.body.verifCode;

  const loginSuccess = await checkUserPassword(userEmail, userPass);
  switch (loginSuccess) {
    case 0:
      //login was failure: User not recognised in DB
      res.status(999).sendFile('/EUTRCApp/verification-failure.html', dirName);
      break;
    case 1:
      //login was a success
      const verify = require('./EUTRCApp/verification.js');
      let query = "SELECT verification_code FROM users WHERE email = '"
        + userEmail + "';";
      let userSQLResult = await verify.queryMySQL(query);
      let userSQLVerifCode = userSQLResult[0]["verification_code"];

      if (userSQLVerifCode == "null"){
        console.log('userSQLVerifCode == null');
        res.status(500).send("Server Error. User verif code not recognised.")
      } else if (verifCode == userSQLVerifCode){
        query = "UPDATE users SET verified = 1, verification_code = 'null' WHERE email = '"
        + userEmail + "';"
        userSQLResult = await verify.queryMySQL(query);
        console.log("User: " + userEmail + " verified.");

        //The next HP, CB, and DV trainings have been requested
        console.log(`Obtaining next HP, CB, and DV trainings.`);
        let resultsList = require('./EUTRCApp/get-next-training.js');
        resultsList = await resultsList.getNextTrainingsList();
        console.log("\nSending json object to client side: " + JSON.stringify(resultsList));
        let name = await getName(userEmail)

        res.status(200).render('eutrc_app/landing', 
          {userInfo: {name, isCoach: isCoach(userEmail), email: userEmail, password: userPass}, 
          hpTraining: resultsList[0], dvTraining: resultsList[1], cbTraining: resultsList[2]})

      } else {
        console.log("Verification codes do not match.");
        let name = await getName(userEmail)
        res.status(200).render('eutrc_app/verification', {name, email: userEmail, password:userPass, status:2})
      }
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

//Common link: Used by any source, sends an automated verification email after checkUserPassword()
app.post('/eutrcapp/verfbot', async (req, res) => {
  console.log('\n\n/eutrcapp/verfbot reached! User ' + req.body.email);
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
      launchVerfBot(userEmail)

      const verify = require('./EUTRCApp/verification.js');
      const query = `SELECT first_name FROM users WHERE email = '${userEmail}';`
      let sqlResult = await verify.queryMySQL(query);
      let name = sqlResult[0]['first_name']

      res.status(200).render('./eutrc_app/verification.ejs', {name, email: userEmail, password:userPass, status:1})
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
  console.log('\n\n/eutrcapp/signup reached! User ' + req.body.email);

  const userEmail = req.body.email;
  const userFirstName = req.body.firstName;
  const userLastName = req.body.lastName;
  const userPhoneNumber = req.body.phoneNumber;
  const userPassword = req.body.password;
  const userCoach = false;

  const verify = require('./EUTRCApp/verification.js');

  //check if user already Exists
  //queries MySQL database for user's password
  let query = `select * from users where email = '${userEmail}';`
  let userSQLResult = await verify.queryMySQL(query);

  if (userSQLResult == null){
    //user doesnt exist so adding to database

    if (userEmail.includes("@exeter.ac.uk")) {
      //email is confirmed @exeter.ac.uk
      query = `insert into users (email, first_name, last_name, phone_number, password)`
        + ` values ("${userEmail}", "${userFirstName}", "${userLastName}", "${userPhoneNumber}", "${userPassword}");`
      
      userSQLResult = await verify.queryMySQL(query);
      console.log("User added to DB!");

      //check user's verification
      let verif = await checkUserVerif(userEmail, userPassword)
      if (verif == null){
        console.log('user verif was == null. Sending server error.');
        res.status(500).send("server error: added user's verif == null.")
      } else if (verif == 1){
        console.log('user is verified! Sending to app.home');
        res.status(200).render('eutrc_app/landing.ejs', {name:'Ethan'})
      } else {
        console.log('user has not yet been verified! Sending to app.verif');
        const query = `SELECT first_name FROM users WHERE email = '${userEmail}';`
        let sqlResult = await verify.queryMySQL(query);
        let name = sqlResult[0]['first_name']
        res.status(200).render('eutrc_app/verification.ejs', {name, email: userEmail, password:userPassword, status:3})
      }
    } else {
      //email is not @exeter.ac.uk
      console.log("Non @exeter.ac.uk email posted! Sending error message");
      res.send("Invalid Email Address.")
    }

  } else {
    //user already exists!
    console.log("User Already exists in database! Sending error message");
    res.status(200).render('eutrc_app/signin.ejs', {status: 3})
  }
});

//link used to sign on on EUTRCApp or future website
app.post('/eutrcapp/login', async (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('\n\n/eutrcapp/login post received. Login in user: '+ userEmail + ' with password; ' + userPass);

  const loginSuccess = await checkUserPassword(userEmail, userPass);
  switch (loginSuccess) {
    case 0:
      //login was failure: User not recognised in DB
      res.status(200).render('eutrc_app/signin', {status:1})
      break;
    case 1:
      //login was a success
      const verify = require('./EUTRCApp/verification.js');
      let verif = await checkUserVerif(userEmail, userPass)
      if (verif == null){
        console.log('user verif was == null. Sending server error.');
        res.status(500).send("server error.")
      } else if (verif == 1){
        console.log('user is verified! Pulling training data and sending to app.home');
        
        //The next HP, CB, and DV trainings have been requested
        console.log(`Obtaining next HP, CB, and DV trainings.`);
        let resultsList = require('./EUTRCApp/get-next-training.js');
        resultsList = await resultsList.getNextTrainingsList();
        console.log("\nSending json object to client side: " + JSON.stringify(resultsList));
        let name = await getName(userEmail)

        res.status(200).render('eutrc_app/landing', 
          {userInfo: {name, isCoach: isCoach(userEmail), email: userEmail, password: userPass}, 
          hpTraining: resultsList[0], dvTraining: resultsList[1], cbTraining: resultsList[2]})
      } else {
        console.log('user has not yet been verified! Sending to app.verif');
        let name = await getName(userEmail)
        
        res.status(200).render('./eutrc_app/verification.ejs', {name, email: userEmail, password:userPass, status:0})
      }
      break;
    case 2:
      //login was failure: Passwords did not match
      res.status(200).render('eutrc_app/signin', {status:2})
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
  console.log('\n\n/eutrcapp/user post received. Getting User info of user: '+ userEmail + ' with password; ' + userPass);

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

      if (userSQLResult == null){
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
        let userSQL_icon = userSQLResult[0]["icon"];

        let userInfo = userSQL_first_name + ';' + userSQL_last_name + ';' + userSQL_phone_number + ';' + userSQL_coach + ';' + userSQL_icon;
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

//general link used to update any user details (eg. icon)
app.post('/eutrcapp/user/update', async (req, res) => {
  console.log('\n\n/eutrcapp/user/update reached! Updating user ' + req.body.email + "'s " + req.header('attribute'));

  let userEmail = req.body.email;
  let userPass = req.body.password;

  let loginSuccess = await checkUserPassword(userEmail, userPass)
  if (loginSuccess != 1){
    console.log("login failed. Cannot update icon.");
    res.status(900).send('login failed.');
    return;
  }

  let attributeUpdate = req.header('attribute');
  if (attributeUpdate.toLowerCase() == 'icon'){
    let iconValue = req.body.icon;
    const verify = require('./EUTRCApp/verification.js');
    let query = "UPDATE users SET icon = " + iconValue + " where email = '" + userEmail
      + "';"
    const sqlResult = await verify.queryMySQL(query);
    res.status(200).send('updated ICON successfully.')
    console.log("updated user ICON Successfully");
  } else if (attributeUpdate.toLowerCase() == 'all'){
    //"email=%s&newEmail=%s&password=%s&firstName=%s&lastName=%s&phoneNumber=%s"
    let newEmail = req.body.newEmail;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let phoneNumber = req.body.phoneNumber;

    const verify = require('./EUTRCApp/verification.js');
    let query = "UPDATE users SET"
      + " email = '" + newEmail
      + "', first_name = '" + firstName
      + "', last_name = '" + lastName
      + "', phone_number = '" + phoneNumber
      + "', verified = 0"
      + " where email = '" + userEmail + "';"
    const sqlResult = await verify.queryMySQL(query);
    res.status(200).send('updated ALL successfully.')
    console.log("updated user ALL Successfully");
  } else if (attributeUpdate.toLowerCase() == 'password'){
    let newPassword = req.body.newPassword;

    const verify = require('./EUTRCApp/verification.js');
    let query = "update users set password = '" + newPassword + "' where email = '" + userEmail + "';"
    const sqlResult = await verify.queryMySQL(query);
    res.status(200).send('updated PASSWORD successfully.')
    console.log("updated user PASSWORD Successfully");
  }


});

//specific link used to delete user details from database
app.post('/eutrcapp/user/delete', async (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('\n\n/eutrcapp/user/delete post received. Logging user: ' + userEmail + ' in and deleting data.');

  const loginSuccess = await checkUserPassword(userEmail, userPass);
  if (loginSuccess == 1){
    const verify = require('./EUTRCApp/verification.js');
    let query = "DELETE FROM users WHERE email = '"
      + userEmail + "';";
    let userSQLResult = await verify.queryMySQL(query);
    res.status(200).send("successfully deleted user.")
    console.log("successfully deleted user: " + userEmail);
  } else {
    console.log("Unsuccessfuly log in.");
    res.status(998).send('Incorrect Permissions.')
  }
});

//link used to check a user's verification
app.post('/eutrcapp/checkverif', async (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('\n\n/eutrcapp/checkverif post received. Getting verification status of user: '+ userEmail + ' with password; ' + userPass);

  const loginSuccess = await checkUserPassword(userEmail, userPass);

  if (loginSuccess == 1){
    //login success!
    let verif = await checkUserVerif(userEmail, userPass)
    if (verif == null){
      console.log('user verif was == null. Sending server error.');
      res.status(500).send("server error.")
    } else if (verif == 1){
      console.log('user is verified! Sending to app.home');
      res.status(200).render('eutrc_app/landing')
    } else {
      console.log('user has not yet been verified! Sending to app.verif');
      res.status(998).render('eutrc_app/verification')
    }

  } else {
    //login failure. App problem bc passed directly after sign in
    console.log("Error (03)");
    res.status(500).send('Error (03)');
  }
});

//link used to retrieve upcoming trainings
app.get('/eutrcapp/trainings.json', async (req, res) => {
  console.log("\n\n/eutrcapp/trainings reached! Getting training schedule...");

  let resultsList = require('./EUTRCApp/get-next-training.js');

  //checking if any headers.. = month training request not just next training
  if (req.header('request') == 'calendar'){
    console.log(`request type = 'calendar'! Converting header ('month', 'year'): ${req.header('month')}, ${req.header('year')}`);
    let month = resultsList.convertMonthHeader(req.header('month'))
    let year = req.header('year').slice(2)

    console.log('TRACE TRACE TRACE: ' + month + ' ' + year);
    const verify = require('./EUTRCApp/verification.js');
    let query = "select * from trainings where date_month = '" + month
      + "' and date_year = '" + year + "';"
    const sqlResult = await verify.queryMySQL(query);

    if (sqlResult == null){
      //No training data for a month!
      res.status(200).send('null');
    } else {
      res.status(200).send(sqlResult);
    }
    return;
  }

  if (req.header('request') == 'next'){
    //if request type = 'next', the next HP, CB, and DV trainings have been requested
    console.log(`request type = 'next'! Obtaining next HP, CB, and DV trainings.`);
    resultsList = await resultsList.getNextTrainingsList();

    let jsonData = {hpTraining: resultsList[0], dvTraining: resultsList[1], cbTraining: resultsList[2]}
    console.log("\nSending json object to client side: " + JSON.stringify(jsonData));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(jsonData);
  }

  if (req.header('request') == 'modify'){
    //if request type = 'modify', coach is currently viewing all trainings for deletion/edits
    console.log(`request type = 'modify'! Obtaining ALL trainings.`);

    const verify = require('./EUTRCApp/verification.js');
    let query = "select * from trainings;"
    const sqlResult = await verify.queryMySQL(query);

    if (sqlResult == null){
      //No training data!
      res.status(200).send('null');
    } else {
      res.status(200).send(sqlResult);
    }
    return;
  }
});

//link used to publish a training to our trainings DB
app.post('/eutrcapp/trainings/create', async (req, res) => {
  console.log('\n\n/eutrcapp/trainings/create reached!');
  if (req.body.coach == 'false'){
    console.log('Non-coach user attemptimg to publish training!');
    res.status(998).send('Incorrect permissions.');
  }

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let loginSuccess = await checkUserPassword(userEmail, userPassword);

  if (loginSuccess == 1){
    const verify = require('./EUTRCApp/verification.js');
    let query = "SELECT coach FROM users WHERE email = '"
      + userEmail + "';";
    let userSQLResult = await verify.queryMySQL(query);


    if (userSQLResult != null){
      console.log("Coach status received! userSQLResult[0]['coach'] = " + userSQLResult[0]["coach"]);
      let userSQL_coach = userSQLResult[0]["coach"];
      if (userSQL_coach == 1){

        //variable declaration + assignment for updating Trainings table
        let trainingInfoDate = req.body.date
        let datesArray = trainingInfoDate.split("/"); //where datesArray[0] = 'dd' && datesArray[1] = 'mm' && datesArray[2] = 'yy'
        let trainingParamsArray = new Array (
          datesArray,
          req.body.team,
          req.body.location,
          req.body.drills,
          req.body.time
        );

        //updates trainings table with new training
        const createTraining = require('./EUTRCApp/trainings/create.js');
        let test = await createTraining.updateTrainings(trainingParamsArray);

        //variable declaration + assignment for creating training-specific table
        let query = "SELECT id FROM trainings WHERE time = '"
          + req.body.time + "' and team = '" + req.body.team + "';";
        let trainingID = await verify.queryMySQL(query);

        //creates new training-specific table with name: training_ID#
        createTraining.createTrainingTable(trainingID[0]['id']); //asynchronously creates new table for training attendance


        res.status(200).send('Successfully pushed training!')

      } else {
        res.status(998).send('Incorrect permissions.')
      }
    } else {
      res.status(999).send('could not verify coach.')
    }
  } else {
    res.status(998).send("failed login.");
  }
});

//link used to mark attendance of specific training
app.post('/eutrcapp/trainings/rsvp', async (req, res) => {
  console.log('\n\nPlayer RSVP-ing to training! User: ' + req.body.email + ', Training id: ' + req.body.trainingID);
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let trainingTable = 'training_' + req.body.trainingID;

  let loginSuccess = await checkUserPassword(userEmail, userPassword);

  if (loginSuccess != 1){
    console.log('login failed.');
    res.status(998).send("failed login.");
    return;
  }

  const verify = require('./EUTRCApp/verification.js');

  let hasAlreadyRSVP = await checkUserAlreadyRSVP(userEmail, trainingTable);
  if (hasAlreadyRSVP == "available"){ //user has previously rsvp yes

    if (req.body.rsvp == "true"){ //user attempting to change yes to yes
      console.log("already rsvp-yes user attempted to update available again!");
      res.status(200).send("Already registered as: Available")

    } else { //user is changing yes to no
      //set rsvp_yes = 0, and rsvp_no = 1
      let query = `update ${trainingTable} set rsvp_yes = 0, rsvp_no = 1 where email = '${userEmail}';`
      await verify.queryMySQL(query);


      //remove attendance and add missed-attendance from user's stats
      query = `select * from users where email = '${userEmail}'`
      let sqlResult = await verify.queryMySQL(query);
      let newUserAttendance = sqlResult[0]['rsvp_yes'] -1;
      let newUserUnAttendance = sqlResult[0]['rsvp_no'] +1;
      query = `update users set rsvp_yes = ${newUserAttendance}, rsvp_no = ${newUserUnAttendance} where email = '${userEmail}'`
      await verify.queryMySQL(query)
      console.log('Successfully changed Users availability from available > unavailable');
      res.status(200).send("Changed Available to Unavailable.")

    }
    return;

  } else if (hasAlreadyRSVP == 'unavailable'){ //user has previously rsvp no

    if (req.body.rsvp == "false"){ //user attempting to change no to no
      console.log("already rsvp-no user attempted to update available again!");
      res.status(200).send("Already registered as: Unavailable")

    } else { //user is changing no to yes
      //set rsvp_yes = 1, and rsvp_no = 0
      let query = `update ${trainingTable} set rsvp_yes = 1, rsvp_no = 0 where email = '${userEmail}';`
      await verify.queryMySQL(query);

      //remove missed-attendance and add attendance from user's stats
      query = `select * from users where email = '${userEmail}'`
      let sqlResult = await verify.queryMySQL(query);
      let newUserAttendance = sqlResult[0]['rsvp_yes'] +1;
      let newUserUnAttendance = sqlResult[0]['rsvp_no'] -1;
      query = `update users set rsvp_yes = ${newUserAttendance}, rsvp_no = ${newUserUnAttendance} where email = '${userEmail}';`
      await verify.queryMySQL(query)
      console.log('Successfully changed Users availability from unavailable > available');
      res.status(200).send("Changed Unavailable to Available.")

    }
    return;

  } else if (hasAlreadyRSVP == "unanswered") { //user has not yet rsvp

    if (req.body.rsvp == "true"){ //user setting (first time) rsvp to yes
      //obtain user's current attendance # (rsvp_yes)
      let query = "SELECT rsvp_yes FROM users WHERE email = '"
        + userEmail + "';";
      let userSQLResult = await verify.queryMySQL(query);
      let newUserAttendance = userSQLResult[0]['rsvp_yes'] + 1;

      //update user's attendance (rsvp_yes) by +1
      query = "UPDATE users set rsvp_yes = " + newUserAttendance
        + " where email = '" + userEmail + "';"
      verify.queryMySQL(query);

      //update training_ID# table, adds user and sets rsvp_yes to 1 (true)
      query = `insert into ${trainingTable} (email, rsvp_yes) values ('${userEmail}', 1);`
      verify.queryMySQL(query);
      res.status(200).send('Succesfully rsvpd YES');

    } else { //user setting (first time) rsvp to no
      //obtain user's current UN-attendance # (rsvp_no)
      let query = "SELECT rsvp_no FROM users WHERE email = '"
        + userEmail + "';";
      let userSQLResult = await verify.queryMySQL(query);
      let newUserAttendance = userSQLResult[0]['rsvp_no'] + 1;

      //update user's UN-attendance (rsvp_no) by +1
      query = "UPDATE users set rsvp_no = " + newUserAttendance
        + " where email = '" + userEmail + "';"
      verify.queryMySQL(query);

      //update training_ID# table, adds user and sets rsvp_no to 1 (true)
      query = `insert into ${trainingTable} (email, rsvp_no) values ('${userEmail}', 1);`
      verify.queryMySQL(query);

      console.log(`Succesfully updated Users UN-attendance, and ${trainingTable} setting rsvp_no = 1.`);
      res.status(200).send('Succesfully rsvpd NO');
    }
    return;
  } else {
    console.log("Inability to process rsvp-ing. Error 5001");
  }


});

//link used to delete a training via trainingID from database
app.post('/eutrcapp/trainings/delete', async (req, res) => {
  console.log(`\n\n/eutrcapp/trainings/delete reached! Attempting to delete training: ${req.body.trainingID}`);
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let trainingTable = 'training_' + req.body.trainingID;
  let trainingID = req.body.trainingID;

  let loginSuccess = await checkUserPassword(userEmail, userPassword);

  //checks if user has correct login details
  if (loginSuccess != 1){
    console.log('login failed.');
    res.status(998).send("failed login.");
    return;
  }

  const verify = require('./EUTRCApp/verification.js');

  //checks if user has COACH crediential (=1/true)
  let query = `select coach from users where email = '${userEmail}';`
  let userSQLResult = await verify.queryMySQL(query);
  if (userSQLResult != null){
    console.log("Coach status received! userSQLResult[0]['coach'] = " + userSQLResult[0]["coach"]);
    let userSQL_coach = userSQLResult[0]["coach"];

    if (userSQL_coach == 1){ //user confirmed coach
      //user is coach! Delete training.
      query = `delete from trainings where id = ${trainingID};`
      verify.queryMySQL(query);

      query = `drop table training_${trainingID};`
      verify.queryMySQL(query);

      console.log(`Successfully deleted training #${trainingID}`);
      res.status(200).send('Successfully deleted training!')
    } else {
      console.log(`User ${userEmail} attempting to delete training #${trainingID}`);
      res.status(998).send('Incorrect permissions.')
    }
  } else {
    console.log("User's coach query was unsuccessfuly. Query return == null");
    res.status(999).send('could not verify coach.')
  }


})

//link used to update the details of an existing training (Coach perms only)
app.post('/eutrcapp/trainings/update', async (req, res) => {
  console.log(`\n\n/eutrcapp/trainings/update reached! Updating training # ${req.header('ID')}`);

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let trainingID = req.header('ID')

  let loginSuccess = await checkUserPassword(userEmail, userPassword);

  //checks if user has correct login details
  if (loginSuccess != 1){
    console.log('login failed.');
    res.status(998).send("failed login.");
    return;
  }

  const verify = require('./EUTRCApp/verification.js');

  //checks if user has COACH crediential (=1/true)
  let query = `select coach from users where email = '${userEmail}';`
  let userSQLResult = await verify.queryMySQL(query);
  if (userSQLResult != null){
    console.log("Coach status received! userSQLResult[0]['coach'] = " + userSQLResult[0]["coach"]);
    let userSQL_coach = userSQLResult[0]["coach"];

    if (userSQL_coach == 1){ //user confirmed coach
      //define variables
      let trainingInfoDate = req.body.date
      let datesArray = trainingInfoDate.split("/"); //where datesArray[0] = 'dd' && datesArray[1] = 'mm' && datesArray[2] = 'yy'
      let team = req.body.team;
      let location = req.body.location;
      let drills = req.body.drills;
      let time = req.body.time;

      query = `update trainings set date_day = '${datesArray[0]}',`
        + ` date_month = '${datesArray[1]}', date_year = '${datesArray[2]}',`
        + ` team = '${team}', location = '${location}', drills = '${drills}', time = '${time}'`
        + ` where id = ${trainingID};`
      await verify.queryMySQL(query);

      console.log(`Successfully updated training #${trainingID}`);
      res.status(200).send('Successfully updated training!')
    } else {
      console.log(`User ${userEmail} attempting to update training #${trainingID}`);
      res.status(998).send('Incorrect permissions.')
    }
  } else {
    console.log("User's coach query was unsuccessfuly. Query return == null");
    res.status(999).send('could not verify coach.')
  }
})

//link used to obtain the attendance of a specific training
app.get('/eutrcapp/trainings/availability.json', async (req, res) => {
  console.log(`\n\n/eutrcapp/trainings/availability.json reached! Getting availability info for training #${req.header('id')}`);
  let id = req.header('id');
  let attendance = 0;
  let unavailability = 0;

  const verify = require('./EUTRCApp/verification.js');

  let query = `select count(if(rsvp_yes = 1, email, NULL)) as count from training_${id};`
  let userSQLResult = await verify.queryMySQL(query);
  if (userSQLResult != null){
    attendance = userSQLResult[0]["count"];

    query = `select count(if(rsvp_no = 1, email, NULL)) as count from training_${id};`
    userSQLResult = await verify.queryMySQL(query);
    if (userSQLResult != null){
      unavailability = userSQLResult[0]["count"];
    }
  }


  let data = {"attendance":attendance, "unavailability":unavailability};
  res.status(200).send(data)
});

/*  ################################################################################
    ################################################################################
    ###############  Handling Routes for EUTRC APP #####################
    ################################################################################
    ################################################################################
*/
//link for EUTRC signin page
app.get('/eutrc/app/signin', async (req, res) => {
  console.log('/eutrc/app/signin reached! Sending login page.');
  res.status(200).render('eutrc_app/signin', {status:0})
})
app.get('/eutrc/app/login', async (req, res) => {
  console.log('/eutrc/app/signin reached! Sending login page.');
  res.status(200).render('eutrc_app/signin', {status:0})
})

app.get('/eutrc/app/signup', async (req, res) => {
  console.log('/eutrc/app/signup reached! Sending signup page.');
  res.status(200).render('eutrc_app/signup', { })
})

//web-hook link to obtain different content panes!
app.get('/eutrc/app/panel', async (req, res) => {
  console.log(`User requesting different content panel! Obtaining content pane: ${req.header('panel')}`);
  var panel = req.header('panel')
  var name = req.header('name')

  let resultsList = require('./EUTRCApp/get-next-training.js');
  switch (panel) {
    case 'home':
      resultsList = await resultsList.getNextTrainingsList();
      res.status(200).render(
        'panels/home', 
        { 
          userInfo: {name}, 
          hpTraining: resultsList[0], 
          dvTraining: resultsList[1], 
          cbTraining: resultsList[2]
        }
      )
      break;
  
    case 'events':
      res.status(200).render('panels/events')
      break;

    case 'moves':
      break;
    default:
      resultsList = await resultsList.getNextTrainingsList();
      res.status(200).render(
        'panels/home', 
        { 
          userInfo: {name}, 
          hpTraining: resultsList[0], 
          dvTraining: resultsList[1], 
          cbTraining: resultsList[2]
        }
      )
      break;
  }
})

//web-hook link to obtain slides regarding moves
app.get('/eutrc/app/moves', async (req, res) => {
  console.log(`Player requested moves! Sending HTML for category: ${req.header('category')} and slide: ${req.header('index')}`);
  var category = req.header('category');
  var index = req.header('index');

  var filepath = '/public/eutrcapp/slides/'

  switch (category) {
    case '#moves_32':
      filepath += '32/'
      break;
    case '#moves_mid':
      filepath += 'mid/'
      break;
    case '#moves_misc':
      break;
  }

  filepath += index + '.html'

  console.log(`Automatic filepath detection: ${filepath}`);
  res.status(200).sendFile(filepath, dirName)
})


/*  ################################################################################
    ################################################################################
    ###########################   404 Handler    ###################################
    ################################################################################
    ################################################################################
*/
app.use( (req, res) => {
  res.status(404).sendFile('/Main/404.html', dirName);
});

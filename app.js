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



app.post('/eutrcapp/verification', (req, res) => {
  const userEmail = req.body.email
  const userPass = req.body.password
  console.log('EUTRCApp verification form received. Verifying user: '+ userEmail + ' with password; ' + userPass);

  async function retrieveUserMySQLPass(userEmail, userPass){
    console.log('async retrieve() called!');
    const verify = require('./EUTRCApp/verification.js');
    let userSQLResult = await verify.getUserPass(userEmail);

    let userSQLPass = JSON.parse(userSQLResult);
    console.log('Trace stack: ' + userSQLPass + userSQLPass.password);

    if (userSQLPass == null) {
      // User was not found in database, or incorrect email address provided.
      console.log("User's pass returned null. (No User in database or Password retrieval error.)");
      res.sendFile('/EUTRCApp/verification-failure.html', dirName);
    } else {
        console.log("Received User's Pass from SQL: " + userSQLPass + " and userPass from form: " + userPass);
        if (userSQLPass == userPass){
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
// establishing MySQL Connection via verification.js and retrieving user's password
//ALL OF THESE ARE ASYNC METHODS, NEED TO USE PROMISES!!

  retrieveUserMySQLPass(userEmail, userPass);
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

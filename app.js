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

// establishing MySQL Connection via verification.js and retrieving user's password
  const verify = require('./EUTRCApp/verification.js')
  const connection = verify.getMySQLConnection();
  const userSQLPass = verify.getMySQLPassword(connection, userEmail);
console.log('Direct trace:');
  console.log(userSQLPass);

// MySQL Query is async, so create an async func that waits for password to be returned before running
  const checkUserPassword = async () => {
    const sqlPass = await userSQLPass;
    console.log("Received User's Pass from SQL: ${sqlPass}, userPass from form: ${userPass}");

    if (sqlPass == null){
// User was not found in database, or incorrect email address provided.
      console.log("User's pass returned null. (No User in database or Password retrieval error.)");
      res.sendFile('/EUTRCApp/verification-failure.html', dirName);
    } else if (sqlPass == userPass){
// Password matches continue to verification emailBot
      console.log("User's pass matches MySQL. Launching verfbot.py");
      verify.pythonBot(userEmail);
      res.sendFile('/EUTRCApp/verification-success.html', dirName);
    } else {
// passwords do not match
      console.log("User's pass does not match MySQL!");
      res.sendFile('/EUTRCApp/verification-failure.html', dirName);
    }
  };
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

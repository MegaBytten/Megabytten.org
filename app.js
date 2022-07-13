//dependencies
const express = require('express');
const app = express();
const mySQLConnection = require('./EUTRCApp/verification.js')

//class variables
const dirName = { root: __dirname };


//might need to listen on IP instead of domain
app.listen(80, 'megabytten.org');

//middleware
app.use(express.urlencoded( {extended: true} ));

//listens for any HTTP GET request on '/' || '/home' url
//home or main responses
app.get('/',  (req, res) => {
  res.sendFile('/Main/home.html', dirName);
});
app.get('/home', (req, res) => {
  res.sendFile('/Main/home.html', dirName);
});


//eutrc responses
app.get('/eutrcapp', (req, res) => {
  res.sendFile('/eutrcapp/main.html', dirName);
});

function checkVerification(userEmail) {

  //pull MySQL Data - if user is verified do:
  //if user has been sent verification email ask to confirm resend
  //if user has successfully been sent first time verif, congrats!

  let pool = mySQLConnection.pool;
  let connection = mySQLConnection.connection;

  pool.getConnection(function(err, connection) {
    console.log('Pool: Connection got.');

    pool.query('SELECT * FROM users', (error, rows) => {
      console.log('Query launched.');
      if (error) {
        console.log(error);
        return;
      }
      this.init();
      console.log(rows);
      });

    //connnection.release();
  });



/*
  connection.query('SELECT * FROM users', (err,rows) => {
    if(err)  console.log(err);

    console.log('Data received from Db:');
    console.log(rows);
  });

*/

}

app.post('/eutrcapp/verification', (req, res) => {
  console.log('verification log reached!');
  const userEmail = req.body.email
  console.log('userEmail = ', userEmail);

  //throws error, no check currently!
  //checkVerification(userEmail);
  require("dotenv").config();
  const spawn = require("child_process").spawn;
  // const pythonProcess = spawn('python',["path/to/script.py", arg1, arg2, ...]);
  const childPython = spawn( 'python', ["EUTRCApp/verfbot.py", process.env.emailBotSender, process.env.emailBotPass, userEmail] );

  childPython.stdout.on('data', (data) => {
    console.log('stdout: $(data)');
  });
  
  //stderr On 'Data' listens for any error output from .py, logged to console
  childPython.stderr.on('data', (data) => {
    console.error('stdout: $(data)');
  });

  //if .py is closed for any reason, posts code (code 0 = no error)
  childPython.on('close', (code) => {
    console.log('python script child process exited with code $(code)');
  });


  res.sendFile('/EUTRCApp/verification-success.html', dirName);

});


//image responses
app.get('/Main/imgs/mbproductionsbanner.png', (req, res) => {
  res.sendFile('/Main/imgs/mbproductionsbanner.png', dirName);
});

app.get('/about', function (req, res) {
  //res.send('about world!');
  //res.sendFile() does not take a RELATIVE path, takes absolute
  res.sendFile('./eutrcapp/verification.html', dirName);
});

//404 handler
app.use( (req, res) => {
  res.status(404).sendFile('/Main/404.html', dirName);
});

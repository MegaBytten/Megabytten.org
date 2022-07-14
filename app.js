//dependencies - will run and establish once everytime server starts
const express = require('express');
const app = express();

//class variables
const dirName = { root: __dirname };
let userEmail = null;

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

app.post('/eutrcapp/verification', (req, res) => {
  console.log('verification log reached!');
  userEmail = req.body.email
  console.log('userEmail = ', userEmail);

  //check if user is registered
  const userPass = require('./EUTRCApp/verification.js')
  console.log("/Verification received userPass: " + userPass);


  require("dotenv").config();
  const emailBotSender = process.env.emailBotSender;
  const emailBotPass = process.env.emailBotPass;

  // Launches Python bot and passes arguments via command line
  // const spawn = require("child_process").spawn;
  // const childPython = spawn(
  //   'py',
  //   ['verfbot.py', emailBotSender, emailBotPass, userEmail],
  //   {shell: true}
  // );
  //
  //
  // childPython.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  //
  // childPython.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
  //
  // childPython.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });


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

module.exports = {
  userEmail
}

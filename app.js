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

app.post('/eutrcapp/verification', (req, res) => {
  console.log('verification log reached!');
  const userEmail = req.body.email
  console.log('userEmail = ', userEmail);

  let pool = mySQLConnection.pool;
  let connection = mySQLConnection.connection;

  pool.getConnection(function(err, connection) {
    console.log('Pool: Connection got.');
  });

  pool.query('SELECT * FROM users', (error, rows) => {
      if (error) {
        return;
      }
      this.init();
      console.log(rows);
    });

/*
  connection.query('SELECT * FROM users', (err,rows) => {
    if(err)  console.log(err);

    console.log('Data received from Db:');
    console.log(rows);
  });
*/
  connnection.release();

  res.sendFile('/EUTRCApp/verification-success.html', dirName);

  //pull MySQL Data - if user is verified do:
  //if user has been sent verification email ask to confirm resend
  //if user has successfully been sent first time verif, congrats!
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

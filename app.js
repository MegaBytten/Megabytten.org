const express = require('express');
const app = express();

const dirName = { root: __dirname };


//might need to listen on IP instead of domain
app.listen(80, 'megabytten.org');

//listens for any HTTP GET request on '/' || '/home' url
app.get('/',  (req, res) => {
  res.sendFile('/Main/home.html', dirName);
});
app.get('/home', (req, res) => {
  res.sendFile('/Main/home.html', dirName);
});

app.get('/eutrcapp', (req, res) => {
  res.sendFile('/eutrcapp/main.html', dirName);
});

app.get('/Main/mbproductions.png', (req, res) => {
  res.sendFile('/Main/mbproductions.png', dirName);
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

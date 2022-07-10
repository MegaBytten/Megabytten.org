const http = require('http');
const fs = require('fs');


//creates server and stores the server instance
const server = http.createServer( (req, res) => {
  //will log to server console
  console.log('request made: ', req.url, req.method);
  //set header content type, can be HTML, text/plain, json

  let htmlResponsePath = './';

  switch (req.url) {
    case '/' || '/home':
      htmlResponsePath += 'Main/Pages/Home/home.html';
      break;
    case '/eutrcapp/verification' || '/eutrcapp':
      htmlResponsePath += 'EUTRCApp/verification.html';
      break;
    default:
      htmlResponsePath += 'Main/Pages/404.html';
      break;
  }

  fs.readFile(htmlResponsePath, (error, data) =>{
    if (error) {
      console.log(error);
      res.end()
    } else {
      res.end(data);
    }
  })
});

//server does not listen for requests until explicitly told to
server.listen(80, 'megabytten.org', () => {
  //CHANGED THIS FROM IP ADDRESS!
  //IF BREAKS, CHANGE BACK TO IP
  console.log('server now listening for HTTP requests on port 80');
});

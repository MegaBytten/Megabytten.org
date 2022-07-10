const http = require('http');

//creates server and stores the server instance
const server = http.createServer( (req, res) => {
  //will log to server console
  console.log('request made');
  //set header content type, can be HTML, text/plain, json
  res.setHeader('Content-Type', 'text/plain');
  res.write('this is my node server!')
  res.end();
});

//server does not listen for requests until explicitly told to
server.listen(80, 'megabytten.org', () => {
  //CHANGED THIS FROM IP ADDRESS!
  //IF BREAKS, CHANGE BACK TO IP
  console.log('server now listening for HTTP requests on port 80');
});

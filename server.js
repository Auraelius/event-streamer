import express from 'express';
import path from 'path';
import morgan from 'morgan'; // logging middleware
import { faker } from '@faker-js/faker';


const app = express();
const PORT = 3000;

// how fast the random stuff is sent
const clockTick = 100;
const consoleTick = 1000;
const templateTick = 10000;
// const updateTick = 500;



// subroutines
/**
 * 
 * @returns {string} fake sentence(s) under 80 chars
 */
function generateRandomConsoleLine() {
  let line = '';
  while (line.length < 80) {
    const randomSentence = faker.lorem.sentence();
    if (line.length + randomSentence.length > 80) break; 
    line += (line.length > 0 ? ' ' : '') + randomSentence;
  }
  return line;
}
/**
 * 
 * @returns {string} one of three sample templates 
 * formatted as a SSE event message data field
 */
function generateNewTemplate () { 
  const templateID = Math.floor(Math.random() * 3) + 1;
  let lines = ``;
  switch (templateID) {
    case 3:
      lines = `data:<i>Function Name Placeholder</i>
data:<h1>Please wait  ...</h1>
data:<p>The zOSEM tables <i>really</i> are being rebuilt. Trust us.</p>
data:<p>Generating function: <span id="func-name">First Function Value</span></p>
data:<p>Depending on the options you have chosen, this process may take some time.</p>
data:<p>Currently processing member: <span id="member-name">First Member Value</span></p>
`; // newline terminated
      break;
    case 2:
      lines = `data:<i>Function Name Placeholder</i>
data:<h1>Please wait ...</h1>
data:<p>The zOSEM tables really <i>are</i> being rebuilt.</p>
data:<p>Generating function: <span id="func-name">First Function Value</span></p>
data:<p>Depending on the options you have chosen, this process may take some time.</p>
data:<p>Currently processing member: <span id="member-name">First Member Value</span></p>
`; // newline terminated
      break;
    case 1:
    default:
      lines = `data:<i>Function Name Placeholder</i>
data:<h1>Please wait...</h1>
data:<p>The zOSEM tables are being rebuilt.</p>
data:<p>Generating function: <span id="func-name">First Function Value</span></p>
data:<p>Depending on the options you have chosen, this process may take some time.</p>
data:<p>Currently processing member: <span id="member-name">First Member Value</span></p>
`; // newline terminated
      break;
  }
  return lines;
}

// set up express middleware
// set up simple default logging of all requests
app.use(morgan("dev"));
// Serve static files from Parcel's default output directory 'dist'
app.use(express.static('dist'));
// send proper mime type for js files
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('text/javascript');
  }
  next();
});

// our endpoints

// SSE timestamp endpoint - sends a timestamp often enough to see the
// seconds change on correct tempo
app.get('/sse-timestamp', (req, res) => {
  console.log('caught a request at /sse-timestamp');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendTimestamp = () => {
    const date = new Date();
    res.write(`event:timestamp\ndata: ${date.toISOString()}\n\n`);
  };
  const intervalId = setInterval(sendTimestamp, clockTick);

  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
    console.log('closed /sse-timestamp connection');
  });
});

// SSE console endpoint - sends a series of text lines
app.get('/sse-console', (req, res) => {
  console.log('caught a request at /sse-console');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendRandomLine = () => {
    const line = generateRandomConsoleLine();
    res.write(`event:console\ndata: ${line}\n\n`);
  };
  const intervalId = setInterval(sendRandomLine, consoleTick);

  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
    console.log('closed /sse-console connection');
  });
});

// SSE panel endpoint
app.get('/sse-panel', (req, res) => {
  console.log('caught a request at /sse-panel');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendPanelTemplateHTML = () => {
    console.log('sending a template')
    const lines = generateNewTemplate(); // newline terminated
    res.write(`event:template\n${lines}\n`);
  };
  const intervalId = setInterval(sendPanelTemplateHTML, templateTick);

  // todo iterate through template sets to show it changing

  // todo send a series of updates on a faster tempo
  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
    console.log('closed /sse-panel connection');
  });
});



// HTML page endpoint
app.get('/page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Page</title>
      <!-- <script src="/index.js"></script>-->
      <!-- <link rel="stylesheet" href="/index.css">-->
    </head>
    <body>
      <h1>Server sent events test page</h1>

      <p>Here's a server clock: </p>
      <server-clock></server-clock>
      <script type="module" src="/server-clock.js"></script>

      <p>Here's a server console: </p>
      <server-console></server-console>
      <script type="module" src="/server-console.js"></script>

      <p>Here's a server panel: </p>
      <server-panel></server-panel>
      <script type="module" src="/server-panel.js"></script>

    </body>
    </html>
  `);
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from 'express';
import path from 'path';
import morgan from 'morgan'; // logging middleware
import { faker } from '@faker-js/faker';
import {
  makeConsoleMessage,
  makeTemplateMessage,
  makeUpdateMessage,
} from './server-utils.js';

/**
 * this node/express-based server has two basic responsibilities
 * 1. serve an html page with some web components (endpoint: `/page`)
 *    along with the JavaScript for those components
 * 2. Serve a variety of server-sent event connections with synthetic data
 *    (endpoints: `/sse-*`)
 * 
 * Quick intro to reading express code: 
 * `req` is the HTTP request. `res` is the HTTP response.  The server
 * routines each convert an HTTP request into an HTTP response.
 * 
 * `res.setHeader()` sets HTTP headers for the response, 
 * `res.write()` sends HTTP text as a response but keeps connection open. 
 * `res.send()` sends HTTP text as a response & closes the connection.
 * `res.end()` closes the connection.
 */

const app = express();
const PORT = 3000;



// different synthetic events are sent on different intervals
// values that are multiples of each other will create 'simultaneous' 
// events (sorted out by the JS single-threaded event loop). 
// we'll see what happens

const clockTick = 100; // a new timestamp every 1/10 second
const consoleTick = 1000; // a new line of text every second
const templateTick = 3000; // a new panel every 10 seconds
const updateTick = 1000; // new panel values every second



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
  console.debug('caught a request at /sse-timestamp');
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
    console.debug('closed /sse-timestamp connection');
  });
});

// SSE console endpoint - sends a series of text lines
app.get('/sse-console', (req, res) => {
  console.log('caught a request at /sse-console');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendRandomLine = () => {
    const msg = makeConsoleMessage();
    res.write(msg);
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

  // sets up two repeating event streams, a slow one with new templates,
  // and a fast one with new updates for the template.
  // update variable names match HTML id attributes in the panel
  // template; else ignored
  
  const sendPanelTemplateHTML = () => {
    const msg = makeTemplateMessage();
    res.write(msg);
  };
  sendPanelTemplateHTML(); // send first one; set up series
  const templateIntervalId = setInterval(sendPanelTemplateHTML, templateTick);

  const sendPanelUpdateHTML = () => {
    // send synthetic values for elements in the template;
    let value = faker.company.buzzPhrase();
    let msg = makeUpdateMessage('member-name', value);
    res.write(msg);

    value = `${faker.word.verb()} ${faker.word.noun()}`;
    msg = makeUpdateMessage('func-name', value); 
    res.write(msg);
  }; // allow time to see inital template values, set up series
  const updateIntervalId = setInterval(sendPanelUpdateHTML, updateTick);

  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(templateIntervalId);
    clearInterval(updateIntervalId);
    res.end();
    console.log('closed /sse-panel connection');
  });
});



// HTML page endpoint
app.get('/3-channel-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Page</title>
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

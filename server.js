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
 * routines basically just convert an HTTP request into an HTTP response.
 *
 * `app.get(url)` defines a function that runs when a GET arrives at `url`
 * `app.use()` adds a plugin to help with requests
 *
 * `res.setHeader()` sets HTTP headers for the response,
 * `res.write()` sends HTTP text as a response but keeps connection open.
 * `res.send()` sends HTTP text as a response & closes connection.
 * `res.end()` closes the connection.
 */

const app = express();
const PORT = 3000;

// different synthetic events are sent on different intervals
// values have "noise" so they don't occasionally coincide

const clockTick = 101; // a new timestamp every 1/10 second
const consoleTick = 1004; // a new line of text
const templateTick = 5703; // a new panel
const fastUpdateTick = 806; // new panel values
const slowUpdateTick = 1602; // new panel values

// set up express middleware:
// - set up simple default logging of all requests
// - Serve static files from Parcel's default output directory 'dist'
// - send proper mime type for js files

app.use(morgan('dev'));
app.use(express.static('dist'));
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

  // immediate arrow function makes & sends msg.
  // interval repeats function periodically
  const sendTimestamp = () => {
    const date = new Date();
    res.write(`event:timestamp\ndata: ${date.toISOString()}\n\n`);
  };
  const clockIntervalId = setInterval(sendTimestamp, clockTick);

  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(clockIntervalId);
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

  // immediate arrow function makes & sends msg.
  // interval repeats function periodically
  const sendRandomLine = () => {
    const msg = makeConsoleMessage();
    res.write(msg);
  };
  const consoleIntervalId = setInterval(sendRandomLine, consoleTick);

  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(consoleIntervalId);
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
  // and a faster one with new updates for the template.
  // update variable names match HTML id attributes in the panel
  // template; else ignored

  // templates
  const sendPanelTemplateHTML = () => {
    const msg = makeTemplateMessage();
    res.write(msg);
  };
  sendPanelTemplateHTML(); // send first one; set up series
  const templateIntervalId = setInterval(sendPanelTemplateHTML, templateTick);

  // updates (two values, two intervals)
  const sendSlowPanelUpdateHTML = () => {
    let value = `${faker.word.verb()} ${faker.word.noun()}`;
    let msg = makeUpdateMessage('func-name', value);
    res.write(msg);
  };
  const slowUpdateIntervalId = setInterval(
    sendSlowPanelUpdateHTML,
    slowUpdateTick
  );

  const sendFastPanelUpdateHTML = () => {
    let value = faker.company.buzzPhrase();
    let msg = makeUpdateMessage('member-name', value);
    res.write(msg);
  };
  const fastUpdateIntervalId = setInterval(
    sendFastPanelUpdateHTML,
    fastUpdateTick
  );

  // stop if the connection is closed
  req.on('close', () => {
    clearInterval(templateIntervalId);
    clearInterval(fastUpdateIntervalId);
    clearInterval(slowUpdateIntervalId);
    res.end();
    console.log('closed /sse-panel connection');
  });
});

// SSE panel endpoint
app.get('/all-in-one', (req, res) => {
  console.log('caught a request at /all-in-one');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // clock
  const sendTimestamp = () => {
    const date = new Date();
    res.write(`event:timestamp\ndata: ${date.toISOString()}\n\n`);
  };
  const clockIntervalId = setInterval(sendTimestamp, clockTick);
  
  // console
  const sendRandomLine = () => {
    const msg = makeConsoleMessage();
    res.write(msg);
  };
  const consoleIntervalId = setInterval(sendRandomLine, consoleTick);

  // templates
  const sendPanelTemplateHTML = () => {
    const msg = makeTemplateMessage();
    res.write(msg);
  };
  sendPanelTemplateHTML(); // send first one; set up series
  const templateIntervalId = setInterval(sendPanelTemplateHTML, templateTick);

  // updates
  const sendSlowPanelUpdateHTML = () => {
    let value = `${faker.word.verb()} ${faker.word.noun()}`;
    let msg = makeUpdateMessage('func-name', value);
    res.write(msg);
  };
  const slowUpdateIntervalId = setInterval(
    sendSlowPanelUpdateHTML,
    slowUpdateTick
  );

  const sendFastPanelUpdateHTML = () => {
    let value = faker.company.buzzPhrase();
    let msg = makeUpdateMessage('member-name', value);
    res.write(msg);
  };
  const fastUpdateIntervalId = setInterval(
    sendFastPanelUpdateHTML,
    fastUpdateTick
  );

  // stop if the connection is closed
  req.on('close', () => {
    // stop the streams
    clearInterval(clockIntervalId);
    clearInterval(consoleIntervalId);
    clearInterval(templateIntervalId);
    clearInterval(fastUpdateIntervalId);
    clearInterval(slowUpdateIntervalId);
    res.end(); // close out the http transaction
    console.log('closed /sse-panel connection');
  });
});
// HTML page endpoints
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Page Doorway</title>
    </head>
    <body>
      <h1>Server sent events test page</h1>
      <p>This is a small set of custom web elements that listen to server-sent events. To supply them with event streams, this includes a web server that services a few endpoints with SSE streams.</p>
      <p>In one example below, each component listens to a separate stream, channel & endpoint. In the other, they all listen to one channel/endpoint but use multiple <i>events</i> to differentiate the different streams.
      <ul>
        <li><a href = "/3-channel-page">listening to three channels/endpoints</a></li>
        <li><a href = "/1-channel-page">listening to one channel/endpoint</a></li>
      </ul>
    </body>
    </html>
  `);
});
app.get('/3-channel-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Page 3 channel</title>
    </head>
    <body>
      <h1>Server sent events<br>three components on three channels</h1>
      <p>This page has three components, each listening to its own default endpoint on the same origin.</p>

      <p>Here's a server clock: </p>
      <server-clock href="/sse-timestamp"></server-clock>
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

app.get('/1-channel-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Page - 1 channel</title>
    </head>
    <body>
      <h1>Server sent events<br>three components on one channel</h1>
      <p>This page has three components, all listening on a single endpoint.
      The server-sent event string routes messages</p>

      <p>Here's a server clock: </p>
      <server-clock href="/all-in-one"></server-clock>
      <script type="module" src="/server-clock.js"></script>

      <p>Here's a server console: </p>
      <server-console href="/all-in-one"></server-console>
      <script type="module" src="/server-console.js"></script>

      <p>Here's a server panel: </p>
      <server-panel href="/all-in-one"></server-panel>
      <script type="module" src="/server-panel.js"></script>

    </body>
    </html>
  `);
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

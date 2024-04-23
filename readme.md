
This is an experiment, a lab toy, to  learn about server-sent events. It contains
three different types of SSE listener web components and an SSE server
that spits out messages.

this node/express-based server has two basic responsibilities

1. serve an html page with the web components (start at endpoint: `/`)
   along with the JavaScript for those components

2. Serve a variety of server-sent event connections with synthetic data
   (endpoints: `/sse-*`)

The web components were built with the `lit` library and bundled with
`parcel`, which results in as simple a set of code as I could come up
with. 

# Fragile; definitely a toy
This experiment serves one page, which then requests one or more SSE
connections. It makes no attempt to manage (close/open) connections across pages.

Don't expect too much and you won't be disappointed. Too much back and
forth with the browser and you'll seize up the server.


# To play with this 

* this runs on node LTS v18, so install that first.
* install the modules needed using `npm install`
* launch the server using `npm run build; npm start`
* point the browser at `localhost:3000`
* open the dev tools to watch the messages go from server to client

# Theory of operation

Here's what I was trying to figure out.

## client side

When a client wants to listen to server sent events, it uses an Event
source. The source code below is simplified, but not by much.

```
evtSource = new EventSource(href);
```
This browser API takes care of the details of requesting and then
maintaining a SSE connection.

Then, the client sets up event handlers for the different sorts of event
streams available at that `href`. Here we're just interested in
"timestamp" events. 

```
evtSource.addEventListener('timestamp', (event) => {
  timestamp = event.data;
  requestUpdate();
});
```
We're using the `lit` library, which makes web components slightly
easier, so that `requestUpdate()` call eventually renders the component:
```
render() {
  return html` <div>Server Time: ${timestamp}</div> `;
}
```

And the server's message appears on screen.

That's it. When an event comes in from the server, it is immediately
displayed. You can use this component anywhere in your HTML.

## Server side

The following code is for a node/express web server, but the principles
are the same regardless of what's serving the HTTP.

When the server recieves the SSE request, it sets a few headers in the
response and writes the first of many messages:
```
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
const date = new Date();
res.write(`event:timestamp\ndata: ${date.toISOString()}\n\n`);
```
Notice the string it sends, which ends up looking like:
```
event:timestamp\ndata:2024-04-23T01:38:59Z\n\n
```

The 'event' field names the message, the 'data' field contains its
contents. The message is terminated with two newlines.

It keeps this connection open, repeating the `res.write` calls to send
out additional messages. If it closes the connection before the client
is done listening, the client will re-open it. Finally, the client
closes the connection and so does the server.

This is how the server passes text messages to the client. But the
server can pass anything that can be encoded as text.


## Structured data

The `data` field can occur on many lines. They are concatinated,
newlines and all, and returned as `event.data` to the event listener. If
we want structured data, we use JSON. 

Here's a routine that formats up an "update" message with the `id` of a
variable and its new `value`. see _server-utils.js_ for details. It's
basically, fill in the blanks and make sure you have two newlines at the end.

```
export function makeUpdateMessage(id, value) {
  const msg = `event: update
data:{
data: "id" : "${id}",
data: "value" : "${value}"
data:}
\n`; // message terminator

  return msg;
}
```
and then, in the web server
```
let msg = makeUpdateMessage('func-name', value);
res.write(msg);
```
We use this technique in the `<server-panel>` component, which uses a
'template' event to send over an HTML template and 'update' events to
provide new values for variables in the template.


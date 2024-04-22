
I used this to learn about server-sent events.

this node/express-based server has two basic responsibilities

1. serve an html page with some web components (endpoint: `/page`)
   along with the JavaScript for those components

2. Serve a variety of server-sent event connections with synthetic data
   (endpoints: `/sse-*`)

# to play with this 

* this runs on node LTS v18, so install that
* install the modules needed using `npm install`
* launch the server using `npm start`
* point the browser at `localhost:3000/3-channel-page`
* open the dev tools to watch the messages go from server to client

# Theory of operation





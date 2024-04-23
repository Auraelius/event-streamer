import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * previous two examples (server-console, server-clock) just displayed
 * text this one is more complicated. the template message contains html
 * (not a template element at this time, just a div and the div's
 * contents). that data text has to be converted to live html. We are
 * using the `lit` library, so we have the `html` template literal and
 * the `unsafeHTML()` converter as tools
 */

class ServerPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      height: 400px; /* todo Adjust height dynamically */
    }
    .message-container {
      height: 100%; /* Ensure it takes the full height of the host */
    }
  `;

  static properties = {
    panelContent: { type: String },
    href: { type: String },
  };

  constructor() {
    super();
    this.panelContent = 'Connecting...';
    this.href = '/sse-panel'; // defaults to it's own channel
  }

  connectedCallback() {
    super.connectedCallback();
    this.evtSource = new EventSource(this.href);

    // 'template' events replace the whole panel.
    // in this lab toy, message data is just thrown into the html
    // in the product we'll take a more secure approach

    this.evtSource.addEventListener('template', (event) => {
      console.debug(`template event: data: ${event.data}`);
      this.panelContent = this.convertToHtml(event.data);
      this.requestUpdate();
    });

    // for update events, data field can contain several sub-fields.
    // these are stored as JSON. The data field as a whole is one JSON
    // object.

    this.evtSource.addEventListener('update', (event) => {
      console.debug(`update event: data: ${event.data}`);
      // pull two expected variables out of JSON data field
      const { id, value } = JSON.parse(event.data);
      const element = this.shadowRoot.querySelector(`#${id}`);
      if (element) {
        element.innerHTML = `${value}`;
      } else {
        console.error(`Element with ID ${id} not found`);
      }
      this.requestUpdate();
    });
  }

  render() {
    // console.log('render');
    return html` <div class="message-container">${this.panelContent}</div> `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.evtSource.close();
  }

  /* * subroutines * * * * * * * * * * */

  //
  /**
   * try to convert message text to elements for later use via `lit`
   *
   * @param {String} text
   * @return {import('lit').HTMLTemplateResult}
   * @memberof ServerPanel
   */
  convertToHtml(text) {
    let parsedHtml = {}; // we'll be getting a bunch of HTML back
    const parser = new DOMParser(); // from our HTML parser
    let htmlBuffer = html``; // and we'll put it here
    try {
      parsedHtml = parser.parseFromString(text, 'text/html');
    } catch (error) {
      throw new Error('convertToHtml: could not parse text');
    }
    // `lit` sanitization & packaging
    htmlBuffer = html`${unsafeHTML(parsedHtml.body.innerHTML)}`;
    return htmlBuffer;
  }
} // class ServerPanel 

customElements.define('server-panel', ServerPanel);

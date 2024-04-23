import { LitElement, html, css } from 'lit';

class ServerConsole extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow-y: scroll;
      height: 100px; /* Adjust height as needed */
    }
    .message-container {
      overflow-y: auto;
      height: 100%; /* Ensure it takes the full height of the host */
    }
  `;

  static properties = {
    messages: { type: Array },
    href: { type: String },
  };

  constructor() {
    super();
    this.messages = ['Connecting...'];
    this.href = '/sse-console'; // defaults to it's own channel
  }

  connectedCallback() {
    super.connectedCallback();
    // set up SSE channel
    this.evtSource = new EventSource(this.href);
    // listen for only our type of events
    this.evtSource.addEventListener('console', (event) => {
      console.debug('console event. data:', event.data);
      this.messages = [...this.messages, event.data];
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.evtSource.close();
  }

  // the `map` puts each message  in the array on its own line
  render() {
    return html`
      <div class="message-container">
        ${this.messages.map((message) => html`${message}<br />`)}
      </div>
    `;
  }

  updated() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const scrollContainer = this.shadowRoot.querySelector('.message-container');
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}

customElements.define('server-console', ServerConsole);

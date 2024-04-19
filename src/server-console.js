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
  };

  constructor() {
    super();
    this.messages = ['Connecting...'];
  }

  connectedCallback() {
    super.connectedCallback();

    this.evtSource = new EventSource('/sse-console');

    this.evtSource.addEventListener('console', (event) => {
      this.messages = [...this.messages, event.data];
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.evtSource.close();
  }

  // puts each message on its own line)
  render () {
    // console.log('render');
    return html`
      <div class="message-container">
        ${this.messages.map((message) => html`${message}<br />`)}
      </div>
    `;
  }
  updated () {
    // console.log('updated');
   this.scrollToBottom();
  }

  scrollToBottom () {
    console.log('scroll to bottom')
  const scrollContainer = this.shadowRoot.querySelector('.message-container');
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}

customElements.define('server-console', ServerConsole);

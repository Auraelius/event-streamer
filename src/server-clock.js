import { LitElement, html, css } from 'lit';

class ServerClock extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `;

  static properties = {
    timestamp: { type: String },
    href: { type: String },
  };

  constructor() {
    super();
    this.timestamp = 'Connecting...';
    this.href = '/sse-timestamp'; // defaults to it's own channel
  }

  connectedCallback() {
    super.connectedCallback();
    this.evtSource = new EventSource(this.href);
    this.evtSource.addEventListener('timestamp', (event) => {
      this.timestamp = event.data;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.evtSource.close();
  }

  render() {
    return html` <div>Server Time: ${this.timestamp}</div> `;
  }
}

customElements.define('server-clock', ServerClock);

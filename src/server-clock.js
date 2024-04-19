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
  };

  constructor() {
    super();
    this.timestamp = 'Connecting...';
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.evtSource = new EventSource('/sse-timestamp');

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

import { LitElement, html, css } from 'lit';

class ServerPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      height: 500px; /* todo Adjust height dynamically */
    }
    .message-container {
      height: 100%; /* Ensure it takes the full height of the host */
    }
  `;

  static properties = {
    panelContent: { type: String },
  };

  constructor() {
    super();
    this.panelContent = 'Connecting...';
  }

  connectedCallback() {
    super.connectedCallback();

    this.evtSource = new EventSource('/sse-panel');

    // template events replace the whole panel
    // in this lab toy, it's thrown into the html
    // in the product we'll take a more secure approach

    this.evtSource.addEventListener('template', (event) => {
      this.panelContent = html`${event.data}`;
      this.requestUpdate();
    });

    // for update events, the id: field is the id of the element to be
    // updated and the data: field is the new content for just that
    // field. here we're just slapping bold tags around it; in the
    // product we'll add a class.

    this.evtSource.addEventListener('update', (event) => {
      const element = this.shadowRoot.querySelector(`#${event.id}`);
      if (element) {
        element.innerHTML = `<b>${event.data}</b>`;
      }
      this.requestUpdate();
    });
  }

  // this isn't strictly required in our product because a new document
  // will wipe away the one this component is in. but in case somebody
  // uses this differently...
  disconnectedCallback() {
    super.disconnectedCallback();
    this.evtSource.close();
  }

  //
  render() {
    // console.log('render');
    return html` <div class="message-container">${this.panelContent}</div> `;
  }
  updated() {
    // console.log('updated');
    // this.scrollToBottom();
  }

  // this shouldn't be needed in the panel
  // scrollToBottom() {
  //   console.log('scroll to bottom');
  //   const scrollContainer = this.shadowRoot.querySelector('.message-container');
  //   scrollContainer.scrollTop = scrollContainer.scrollHeight;
  // }
}

customElements.define('server-panel', ServerPanel);

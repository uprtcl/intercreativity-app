import { LitElement, html, css } from 'lit-element';
import { moduleConnect } from '@uprtcl/micro-orchestrator';

import '@material/mwc-button';

export class Home extends moduleConnect(LitElement) {
  
  newDocument() {

  }

  render() {
    return html`
      <div class="column home">
        <div>
          <mwc-button @click=${this.newDocument} raised>new document</mwc-button>
        </div>
      </div>
    `;
  }

  static styles = css`
    .home {
      justify-content: center;
      text-align: center;
    }
  `;
}
import { LitElement, html, query } from 'lit-element';
import { Router } from '@vaadin/router';

import { setupRouter } from './router';
import { sharedStyles } from './styles';

export class App extends LitElement {
  @query('#outlet')
  outlet: HTMLElement;

  async firstUpdated() {
    setupRouter(this.outlet);
    Router.go('/home');
  }

  render() {
    return html` <div id="outlet"></div> `;
  }

  static get styles() {
    return sharedStyles;
  }
}

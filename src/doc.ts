import {LitElement, html, css} from 'lit-element';

export class Doc extends LitElement {
  
  render() {
    return html`
      <h1>Document</h1>
      <p>This is the wiki</p>
    `;
  }

  static styles = css`
  `;
}
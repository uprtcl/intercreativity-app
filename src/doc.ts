import { LitElement, html, css, property } from 'lit-element';
import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { EveesModule, EveesRemote } from '@uprtcl/evees';
import { HttpEthAuthProvider } from '@uprtcl/http-provider';

import { Router } from '@vaadin/router';

export class Doc extends moduleConnect(LitElement) {
  @property({ attribute: false })
  docId!: string;
  //
  @property({ attribute: false })
  defaultAuthority!: string;

  @property({ attribute: false })
  perspectiveId: string;

  @property({ attribute: false })
  pageId: string;

  async firstUpdated() {
    const pathElements = window.location.pathname.split('/');

    this.docId = pathElements[2];

    const eveesHttpProvider = this.requestAll(
      EveesModule.bindings.EveesRemote
    ).find((provider: EveesRemote) =>
      provider.authority.startsWith('http')
    ) as HttpEthAuthProvider;

    await eveesHttpProvider.connect();
    this.defaultAuthority = eveesHttpProvider.authority;
  }

  goHome() {
    Router.go(`/home`);
  }

  goToPerspective(e) {
    const { detail: { rootPerspective, perspective } } = e;    
    Router.go(`/space/${rootPerspective}/${(!perspective) ? 'official' : perspective}`);
  }

  goToPage(e) {
    const { detail: { official, pageId, perspective, rootPerspective } } = e;    
    Router.go(`/space/${rootPerspective}/${(official) ? 'official' : perspective}/${pageId}`);
  }

  render() {
    if (this.docId === undefined) return '';

    // If property `external-routing` is removed, the component will nagivate internarlly

    return html`    
      <wiki-drawer
        @back=${() => this.goHome()}  
        @select-perspective=${(e) => this.goToPerspective(e)}   
        @select-page=${(e) => this.goToPage(e)}           
        external-routing=${true}
        ref=${this.docId}
        default-authority=${this.defaultAuthority}
        .editableAuthorities=${[this.defaultAuthority]}
      ></wiki-drawer>
    `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    wiki-drawer {
      flex-grow: 1;
    }
  `;
}

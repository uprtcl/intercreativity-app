import { LitElement, html, css } from 'lit-element';
import { ApolloClient } from 'apollo-boost';

import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { EveesModule, EveesRemote, EveesHelpers } from '@uprtcl/evees';
import { ApolloClientModule } from '@uprtcl/graphql';

import '@material/mwc-button';
import { Router } from '@vaadin/router';

export class Home extends moduleConnect(LitElement) {
  
  async newDocument() {
    const eveesEthProvider = this.requestAll(EveesModule.bindings.EveesRemote).find((provider: EveesRemote) =>
      provider.authority.startsWith('eth')
    ) as EveesRemote;

    const client = this.request(ApolloClientModule.bindings.Client) as ApolloClient<any>;

    const wiki = {
      title: 'doc',
      pages: []
    };
    
    const dataId = await EveesHelpers.createEntity(client, eveesEthProvider, wiki);
    const headId = await EveesHelpers.createCommit(client, eveesEthProvider, { dataId });

    const randint = 0 + Math.floor((10000 - 0) * Math.random());
    const perspectiveId = await EveesHelpers.createPerspective(client, eveesEthProvider, { 
      headId, 
      context: `genesis-dao-wiki-${randint}`, 
      canWrite: eveesEthProvider.userId
    });

    console.log(perspectiveId);

    Router.go(`/doc/${perspectiveId}`);
  }

  render() {
    return html`
      <div>
        <mwc-button @click=${this.newDocument} raised>new space</mwc-button>
      </div>
    `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }
  `;
}
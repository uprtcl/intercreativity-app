import { LitElement, html, css, property } from 'lit-element';
import { ApolloClient } from 'apollo-boost';
import { Contract } from 'web3-eth-contract';

import { moduleConnect, request } from '@uprtcl/micro-orchestrator';
import { EveesModule, EveesRemote, EveesHelpers } from '@uprtcl/evees';
import { ApolloClientModule } from '@uprtcl/graphql';

import '@material/mwc-button';
import { Router } from '@vaadin/router';

import { EthereumConnection, EthereumContract } from '@uprtcl/ethereum-provider';

import { abi, networks } from './contracts-json/UprtclHomePerspectives.min.json';

import { EthereumConnectionBinding } from './init';

const getHomePerspective = async (uprtclHome, address) => {
  const events = await uprtclHome.getPastEvents('HomePerspectiveSet', {
    filter: { owner: address },
    fromBlock: 0
  });

  if (events.length === 0) return '';

  const last = events.sort((e1, e2) => (e1.blockNumber > e2.blockNumber) ? 1 : -1).pop();
  
  return last.returnValues.perspectiveId;
}

export class Home extends moduleConnect(LitElement) {

  @property({ attribute: false }) 
  loadingSpaces: boolean = true;

  @property({ attribute: false }) 
  loadingHome: boolean = true;

  @property({ attribute: false }) 
  creatingNewDocument: boolean = true;

  @property({ attribute: false }) 
  home: string | undefined = undefined;

  connection: EthereumConnection;
  spaces!: object;
  uprtclHomePerspectives: EthereumContract;

  async firstUpdated() {
    this.connection = this.request(EthereumConnectionBinding);
    await this.connection.ready();

    this.uprtclHomePerspectives = new EthereumContract({ 
      contract: { 
        abi: abi as any, 
        networks 
      } 
    }, 
    this.connection);

    await this.uprtclHomePerspectives.ready();

    this.loadAllSpaces();
    this.loadHome();
  }

  async loadAllSpaces() {
    await this.connection.ready();
    
    this.loadingSpaces = true;
    const events = await this.uprtclHomePerspectives.contractInstance.getPastEvents('HomePerspectiveSet', {
      fromBlock: 0
    });
  
    this.spaces = {};
    for (const event of events) {
      this.spaces[event.returnValues.owner] = event.returnValues.perspectiveId;
    }
    this.loadingSpaces = false;
  }

  async loadHome() {
    this.loadingHome = true;
    this.home = await getHomePerspective(this.uprtclHomePerspectives.contractInstance, this.connection.getCurrentAccount());
    this.loadingHome = false;
  }
  
  async newDocument() {
    this.creatingNewDocument = true;
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

    await this.uprtclHomePerspectives.send('setHomePerspectivePublic(string)', [ perspectiveId ]);
    this.creatingNewDocument = true;

    Router.go(`/doc/${perspectiveId}`);
  }

  render() {
    return html`
      <div>
        <mwc-button @click=${this.newDocument} raised>crete your space</mwc-button>
        <div>${this.home}</div>
        <div>${this.spaces ? Object.keys(this.spaces).map(space => this.spaces[space]) : ''}</div>
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
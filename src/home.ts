import { LitElement, html, css, property, query } from 'lit-element';
import { ApolloClient } from 'apollo-boost';

import { moduleConnect, request } from '@uprtcl/micro-orchestrator';
import { EveesModule, EveesRemote, EveesHelpers, EveesEthereum, Secured, deriveSecured } from '@uprtcl/evees';
import { ApolloClientModule } from '@uprtcl/graphql';

import '@material/mwc-button';
import '@material/mwc-snackbar';

import { Router } from '@vaadin/router';

import { EthereumConnection, EthereumContract } from '@uprtcl/ethereum-provider';

import { abi as abiHome, networks as networksHome } from './contracts-json/UprtclHomePerspectives.min.json';
import { abi as abiWrapper, networks as networksWrapper } from './contracts-json/UprtclWrapper.min.json';

import { EveesEthereumBinding } from './init';
import { NewPerspectiveData, Perspective } from '@uprtcl/evees/dist/types/types';
import { getHomePerspective, CREATE_AND_SET_HOME } from './support';

export class Home extends moduleConnect(LitElement) {

  @property({ attribute: false })
  loadingSpaces: boolean = true;

  @property({ attribute: false })
  loadingHome: boolean = true;

  @property({ attribute: false })
  creatingNewDocument: boolean = false;

  @property({ attribute: false })
  infoText: string = '';

  @query('#snack-bar')
  snackBar!: any;

  @property({ attribute: false })
  home: string | undefined = undefined;

  eveesEthereum: EveesEthereum;
  connection: EthereumConnection;
  spaces!: object;
  uprtclHomePerspectives: EthereumContract;
  uprtclWrapper: EthereumContract;

  async firstUpdated() {
    this.eveesEthereum = this.request(EveesEthereumBinding);
    this.connection = (this.eveesEthereum as any).ethConnection;

    await this.connection.ready();

    this.uprtclHomePerspectives = new EthereumContract({
      contract: {
        abi: abiHome as any,
        networks: networksHome
      }
    },
      this.connection);

    this.uprtclWrapper = new EthereumContract({
      contract: {
        abi: abiWrapper as any,
        networks: networksWrapper
      }
    },
      this.connection);

    await this.uprtclHomePerspectives.ready();

    this.loadAllSpaces();
    this.loadHome();
  }

  updated(changedProperties) {
    if (changedProperties.has('creatingNewDocument')) {
      this.showInfo()
    }
  }

  showInfo() {
    if (this.creatingNewDocument === true) {
      this.infoText = 'creating space';
      this.snackBar.show();
    } else {
      this.snackBar.close();
    }
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

    const randint = 0 + Math.floor((1000000000 - 0) * Math.random());

    /** create the perspectuve manually to call wrapper createAndSetHome in one tx */
    const perspectiveData: Perspective = {
      creatorId: this.connection.getCurrentAccount(),
      authority: eveesEthProvider.authority,
      timestamp: Date.now()
    };

    const perspective: Secured<Perspective> = await deriveSecured(
      perspectiveData,
      eveesEthProvider.cidConfig
    );

    const newPerspective: NewPerspectiveData = {
      perspective,
        details: { headId, name: '', context: randint.toString() },
        canWrite: this.connection.getCurrentAccount()
    }

    const ethPerspectives = await this.eveesEthereum.preparePerspectives([newPerspective]);

    await this.uprtclWrapper.ready();    
    await this.uprtclWrapper.send(
      CREATE_AND_SET_HOME,
      [ ethPerspectives[0],
      this.connection.getCurrentAccount() ]
    );

    const perspectiveId = perspective.id;
    this.go(perspectiveId);
  }

  go(perspectiveId: string) {
    Router.go(`/doc/${perspectiveId}`);
  }

  renderSpaces() {
    if (this.spaces === undefined) return '';

    const addresses = Object.keys(this.spaces).filter(address => address !== this.connection.getCurrentAccount());

    return html`
      <mwc-list>
        ${ addresses.map(address => {
          const space = this.spaces[address];
          return html`
            <mwc-list-item @click=${() => this.go(space)}>${address}</mwc-list-item>
          `
        })}
      </mwc-list>
    `;
  }

  render() {
    return html`
      <div class="button-container">
        ${this.home === undefined || this.home === '' ?
        html`<mwc-button @click=${this.newDocument} raised>crete your space</mwc-button>` :
        html`<mwc-button @click=${() => this.go(this.home)} raised>go to your space</mwc-button>`
      }
      </div>
      
      <div class="section-title">Recent Spaces</div>
      <div class="spaces-container">
        ${this.renderSpaces()}
      </div>

      <mwc-snackbar id="snack-bar" timeoutMs="-1"
        labelText=${this.infoText}>
      </mwc-snackbar>
    `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding: 0px 10px;
    }

    .section-title {
      font-weight: bold;
      margin-bottom: 9px;
      color: gray;
    }

    .button-container {
      margin-bottom: 35px;
    }

    .spaces-container {
      max-width: 400px;
      margin: 0 auto;
      box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
      margin-bottom: 36px;
      border-radius: 4px;
      background-color: rgb(255,255,255,0.6);
    }

  `;
}
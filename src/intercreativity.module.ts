import { MicroModule, MicroOrchestrator, i18nextBaseModule } from '@uprtcl/micro-orchestrator';

import { LensesModule } from '@uprtcl/lenses';
import { DocumentsModule } from '@uprtcl/documents';
import { WikisModule } from '@uprtcl/wikis';

import { CortexModule } from '@uprtcl/cortex';
import { AccessControlModule } from '@uprtcl/access-control';
import { EveesModule } from '@uprtcl/evees';

import { ApolloClientModule } from '@uprtcl/graphql';
import { DiscoveryModule } from '@uprtcl/multiplatform';

export class MultiProviderWikiModule extends MicroModule {
  static id = 'multi-provider-wiki-module';

  evees: EveesModule;
  documents: DocumentsModule;
  wikis: WikisModule;

  dependencies = [];

  async onLoad() {
  }

  constructor(eveesRemotes, defaultRemote ) {
    super();
    this.evees = new EveesModule(eveesRemotes, defaultRemote);
    this.documents = new DocumentsModule();
    this.wikis = new WikisModule();
  }

  get submodules() {
    return [
      new CortexModule(),
      new i18nextBaseModule(),
      new ApolloClientModule(),
      new DiscoveryModule(),
      new LensesModule(),
      new AccessControlModule(),
      this.evees,
      this.documents,
      this.wikis
    ];
  }
}

export async function loadWikiModule(eveesRemotes, defaultRemote) {
  const wikiModule = new MultiProviderWikiModule(eveesRemotes, defaultRemote);
  const orchestrator = new MicroOrchestrator();
  await orchestrator.loadModule(wikiModule);
}

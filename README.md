# Dev

This app relies heavily on [`js-uprtcl`](https://github.com/uprtcl/js-uprtcl).

To work on it, you should

Checkout and run `npm run dev` on [`eth-uprtcl`](https://github.com/uprtcl/eth-uprtcl).

Have a browser with Metamask and connect it to your localhost:8545 (created by eth-uprtcl)

Then go to the `develop` branch of this repo and run

```
npm i
npm run dev
```

The app uses web components from the `js-uprtcl` library. The most important ones are

`<wiki-drawer>` from `./modules/wikis` (@uprtcl/wikis)

`<document-editor>` from `./modules/documents` (@uprtcl/documents)

`<evees-info-page>` from `./modules/evees` (@uprtcl/evees)

To edit those, checkout the `develop` branch of `js-uprtcl` and create an npm link to those packages.

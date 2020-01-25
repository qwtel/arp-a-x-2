# arp-a-x-2

**ARP** **A**ll Cross (**X**) Platform Version **2**

Modernized version of the [`arp-a-x`](https://www.npmjs.com/package/arp-a-x-2) package.

Like the original uses native implementation when possible.
Returns promises and provides JSDoc types for VSCode and TypeScript integration.

Note that the API has changed and is not backwards compatible!


## Install

    npm install -g --unsafe-perm arp-a-x-2


## Usage


```js
const { arpTable, ipLookupMap, macLookup } = require('arp-a-x-2');

(async () => {
  // Get the entire ARP table
  console.log(await arpTable());

  // ES6 Map from IP addresses to devices (see type signature)
  console.log(await ipLookupMap());

  // Can also find a device based by its MAC address (case-insensitive)
  console.log(await macLookup('xx:xx:xx:xx:xx:xx'));
})();
```


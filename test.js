const { arpTable, ipLookupMap, macLookup } = require('.');

(async () => {
  try {
    // Get the entire ARP table
    console.log(await arpTable());

    // ES6 Map from IP addresses to devices (see type signature)
    console.log(await ipLookupMap());

    // Can also find a device based by its MAC address (case-insensitive)
    console.log(await macLookup('xx:xx:xx:xx:xx:xx'));
  } catch (e) { console.error(e) }
})();
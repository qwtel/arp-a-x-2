const { getTable, getIPMap, findByMAC } = require('.');

(async () => {
  // Get the entire ARP table
  console.log(await getTable());

  // ES6 Map from IP addresses to devices (see type signature)
  console.log(await getIPMap());

  // Can also find a device based by its MAC address (case-insensitive)
  console.log(await findByMAC('xx:xx:xx:xx:xx:xx'));
})();
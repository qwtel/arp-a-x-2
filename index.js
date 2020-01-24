// const { promisify } = require('util');
const child = require('child_process');
const fs = require('fs').promises;

const { once, slurp } = require('./util');

/** 
 * @type {() => Promise<Array<{ ip: string, mac: string, flag?: string, iface?: string, ifname?: string }>>}
 */
let getTable = () => { throw Error('Unsupported platform') };

if (process.platform.indexOf('darwin') === 0) {
  const arp = require('./build/Release/macos.node');
  getTable = () => arp.arpTable();
}

if (process.platform.indexOf('linux') === 0) {
  /* as noted in node-arp
  
    parse this format
  
    IP address       HW type     Flags       HW address            Mask     Device
    192.168.1.1      0x1         0x2         50:67:f0:8c:7a:3f     *        em1
  
   */

  getTable = async function () {
    const data = await fs.readFile('/proc/net/arp');
    return data.toString().split('\n').map((line, i) => {
      if (i === 0) return null;

      const cols = line.replace(/ [ ]*/g, ' ').split(' ');

      return (cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) ? {
        ip: cols[0],
        flag: cols[2],
        mac: cols[3],
        iface: cols[5],
      } : null;
    }).filter(x => !!x);
  };
}

if (process.platform.indexOf('win') === 0) {
  /* as noted in node-arp
  
    parse this format
  
    [blankline]
    Interface: 192.168.1.54
      Internet Address      Physical Address     Type
      192.168.1.1           50-67-f0-8c-7a-3f    dynamic
  
   */

  const RE_IPV4_MAC = /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\s+(([0-9a-fA-F]{2}(:|-)){5}[0-9a-fA-F]{2})/iu;

  getTable = async function () {
    const arp = child.spawn('arp', ['-a']);
    const stdout = await slurp(arp.stdout);
    const code = await once(arp, 'close');

    if (code !== 0) throw new Error('exit code ' + code + ', reason: ' + await slurp(arp.stderr));

    return stdout.split('\n').map((line, i) => {
      if (i < 3) return null;

      const m = line.match(RE_IPV4_MAC);
      return m ? {
        ip: m[1],
        mac: m[6].replace(/-/g, ':'),
      } : null;
    }).filter(x => !!x);
  }
}

/** 
 * @returns {Promise<Map<string, { ip: string, mac: string, flag?: string, iface?: string, ifname?: string }>>}
 */
const getMACMap = async () => new Map((await getTable()).map(x => [x.mac.toLowerCase(), x]));

/** 
 * @returns {Promise<Map<string, { ip: string, mac: string, flag?: string, iface?: string, ifname?: string }>>}
 */
const getIPMap = async () => new Map((await getTable()).map(x => [x.ip, x]));

/** 
 * @param {string} ip A local IPv4 address as string
 * @returns {Promise<{ ip: string, mac: string, flag?: string, iface?: string, ifname?: string } | undefined>} The ARP table entry for the given IP address or undefined
 */
const findByIP = (ip) => getIPMap().then(m => m.get(ip));

/** 
 * @param {string} mac A local MAC address as hex-string (case-insensitive)
 * @returns {Promise<{ ip: string, mac: string, flag?: string, iface?: string, ifname?: string } | undefined>} The ARP table entry for the given MAC address or undefined
 */
const findByMAC = (mac) => getMACMap().then(m => m.get(mac.toLowerCase()));

module.exports = {
  getTable,
  getMACMap,
  getIPMap,
  findByIP,
  findByMAC,
}
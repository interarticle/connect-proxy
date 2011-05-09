/*!
 * Connect-Proxy
 *
 * @author Christoph Werner <gonsfx@googlemail.com>
 * MIT Licensed
 */

/**
 * IP/CIDR validation regex
 */
var regexIp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[12][0-9]|[0-9]))?$/;

/**
 * Change clients ip address and host based on trusted proxies and given request-headers
 *
 * Options:
 *   - `trusted`    identifies trusted proxy ip or ip-range. will default to 127.0.0.1 if not set
 *                  or wrong format
 *   - `strict`     strict mode setting, defaults to true. if set to false, finding an untrusted
 *                  proxy will not result in an error
 *   - `ipHeader`   header property in which originating ip address and additionalr proxy ip
 *                  addresses are defined. defaults to 'x-forwarded-for'
 *   - `hostHeader` header property in which originating host and additional proxy hosts are
 *                  defined. defaults to 'x-forwarded-host'
 *
 * @param  {Object} options
 * @api public
 */
exports.realValues = function(options) {
  var options = options || {},
      trustedRange = parseCidr(regexIp.test(options.trusted) ? options.trusted : '127.0.0.1'),
      ipHeader = options.ipHeader || 'x-forwarded-for',
      hostHeader = options.hostHeader || 'x-forwarded-host',
      strictMode = typeof options.strict === 'undefined' ? true : options.strict;

  return function (req, res, next) {
    var ipValue = req.headers[ipHeader],
        hostValue = req.headers[hostHeader],
        originatingIp, originatingHost;

    if (!ipValue) {
      return next();
    }
    ipValue = ipValue.split(',').map(trim);
    originatingIp = ipValue.shift();

    if (isTrusted(ipValue.concat(req.socket.remoteAddress), trustedRange)) {
      req.socket.remoteAddress = originatingIp;
      if (typeof hostValue !== 'undefined') {
        req.headers.host = hostValue.split(',').map(trim).shift();
      }
    } else if (strictMode) {
      return next(new Error('Incoming connection from untrusted proxy.'));
    }
    next();
  };
}

/**
 * Checks if all proxy IPs are trusted
 *
 * @param  {Array}  proxyIps
 * @param  {Object} trustedRange
 * @api private
 */
function isTrusted(proxyIps, trustedRange) {
  var i, j, ip, len = proxyIps.length;

  for (i = 0; i < len; i++) {
    proxyIp = proxyIps[i].split('.').map(toDecimal);
    for (j = 0; j < 4; j++) {
      if (proxyIp[j] < trustedRange.min[j] || proxyIp[j] > trustedRange.max[j]) return false;
    }
  }
  return true;
};

/**
 * Returns IP-range information for given CIDR string
 *
 * @param  {String} range
 * @return {Object}
 * @api private
 */
function parseCidr(range) {
  var split = range.split('/'),
      bits = split[1],
      octets = split[0].split('.').map(toDecimal),
      subnetmask = [ 0, 0, 0, 0 ],
      bitpos = 0,
      bitpat = 0xff00,
      count = Math.pow(2, 32 - bits);

  if (typeof bits === 'undefined') {
    return { count: 1, min: octets, max: octets };
  }

  while (bits >= 8) {
    bits -= 8;
    subnetmask[bitpos] = 255;
    bitpos++;
  }
  while (bits > 0) {
    bitpat = bitpat >> 1;
    bits--;
  }
  subnetmask[bitpos] = bitpat & 0xff;

  return {
    count: count,
    min: [
      octets[0] & subnetmask[0], octets[1] & subnetmask[1],
      octets[2] & subnetmask[2], octets[3] & subnetmask[3]
    ],
    max: [
      octets[0] | (~subnetmask[0] & 0xff), octets[1] | (~subnetmask[1] & 0xff),
      octets[2] | (~subnetmask[2] & 0xff), octets[3] | (~subnetmask[3] & 0xff)
    ]
  };
};

/**
 * Returns parseInt with radix 10
 *
 * @param  {Mixed}  value
 * @return {Number}
 * @api private
 */
toDecimal = function(value) {
  return parseInt(value, 10);
};

/**
 * Returns trimmed string
 *
 * @param  {Mixed} value
 * @return {Mixed}
 * @api private
 */
trim = function(value) {
  return typeof value === 'string' ? value.replace(/(^\s+)|(\s+$)/, '') : value;
}

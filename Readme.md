# Connect-Proxy
Connect-Proxy is a middleware layer for [Connect](https://github.com/senchalabs/connect) that retrieves originating IP/Host values when proxying to your connect app.

## Purpose
When proxying to node (often done because of host/port restrictions, albeit the shortcomings of this approach), the IP address at `req.socket.remoteAddress` is the IP of the proxy server and `req.headers.host` is the internal hostname:port of the node server, e.g. localhost:3000.

This middleware allows you to use your connect-based app regardless of your node installation being proxied to. It also helps you utilize features of connect that depend on the described header values and would otherwise lead to unexpected results:

   - Logging `:remote-addr`: The address logged by using the `:remote-addr`-Token of connects logger middleware is no longer the address of the proxy, but the address of the user
   - Redirecting to `'/'`:
.

It does so by replacing properties of the req object with values taken from special headers containing the originating IP address and the host name that was originally accessed. Most proxies send these kind of headers, usually `x-forwarded-for` and `x-forwarded-host` . These headers can be comma separated lists in case of multiple proxies, with the left-most being the originating value.

Docs: [Apache](http://httpd.apache.org/docs/2.3/mod/mod_proxy.html#x-headers), [Nginx](http://wiki.nginx.org/HttpProxyModule), [Squid](http://www.squid-cache.org/Doc/config/forwarded_for/)

## Install

`npm install connect-proxy`

## Usage

Require the module:

    var proxy = require('connect-proxy');

Use the middleware by calling `realValues` with an options object:

    app.configure(function() {
      app.use(proxy.realValues({
        trusted: '141.10.214.0/24',
        strict: false,
        ipHeader: 'x-real-ip'
      }));
    }

## Options

   - `trusted` {String} request headers can be faked. this option option tells connect-proxy to only trust the given proxy ip or ip-range. ip-ranges must be written in [CIDR](http://en.wikipedia.org/wiki/CIDR_notation) notation. defaults to _'127.0.0.1'_ if not set or wrong format.
   - `strict` strict mode, defaults to _true_. when an untrusted ip-address is found, connect-proxy will throw an error. if this is set to false, no error will be thrown and proxy headers will be ignored.
   - `ipHeader` header property in which originating ip address and additional proxy ip addresses are defined. defaults to _'x-forwarded-for'_
   - `hostHeader`

## Connect Compatibility
Works with Connect@1.3.0

If someone finds out more, drop me a line.

## License
View the [LICENSE](https://github.com/gonsfx/connect-proxy/blob/master/LICENSE) file.
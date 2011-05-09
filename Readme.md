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
        trusted: '127.0.0.1'
      }));
    }

## Options

   - `trusted` description
   - `strict`
   - `ipHeader`
   - `hostHeader`

## Connect Compatibility
Works with Connect@1.3.0

If someone finds out more, drop me a line.

## License
View the [LICENSE](https://github.com/gonsfx/connect-proxy/blob/master/LICENSE) file.
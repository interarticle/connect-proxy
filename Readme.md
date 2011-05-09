# Connect-Proxy
Connect-Proxy is a middleware layer for [connect](https://github.com/senchalabs/connect) that retrieves originating IP/Host values when proxying to your connect app.

## Purpose
When proxying to node from apache (often done because of host/port restrictions, albeit the shortcomings of this approach), the IP address at req.socket.remoteAddress is the IP of the proxy server and req.headers.host is the internal hostname:port of the node server, e.g. localhost:3000.

This middleware allows you to use your connect-based app regardless of your node installation being proxied to. It also helps you utilize features of connect that depend on the described header values:
  - Logging `:remote-addr`:
    When logging with connects logger middleware, the address logged is the proxies ip
  - Redirecting to `'/'`:
    Test

It does so by replacing properties of the req object with values taken from special headers containing the originating IP address and the host name that was originally accessed. Most proxies send these kind of headers, usually its 'x-forwarded'-Headers, but variations do exist ([apache](http://httpd.apache.org/docs/2.3/mod/mod_proxy.html#x-headers), nginx). Those can be comma separated lists in case of multiple proxies, with the left-most being the originating value.

## Connect Compatibility
If someone finds out, drop me a line.

## License
View the [LICENSE](https://github.com/gonsfx/connect-proxy/blob/master/LICENSE) file.
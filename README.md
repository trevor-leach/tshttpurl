# tshttpurl
Http URL parser, validator, and normalizer.

```typescript
 myURL = new HttpURL('Foo.org/a/./c/../B//%64/CR%9a?b=c;a=;C=%64#');
 myURL.host // "foo.org"
 myUrL.toString(); // "http://foo.org:80/a/B/d/CR%9A?C=d&a&b=c"
```

The nomalizattions that are performed include:

* A missing scheme is assumed to be `http`
* The scheme and host are converted to lowercase
     * If the host is an IP V6 address, then IPv6::toString value is used
* A missing port is assumed to be `80` or `443`
* Percent encoded triplets are converted to upper case
* Unnecessary percent encoded triplets are decoded
* Path traversals:
    * `.` and `..`are interpreted
    * `//` is collapsed
    * The path is verified to not climb out past the root
* Query parameters are ordered by name, then value

----
There is also an IP address parser, validator, and normalizer:
```typescript
myIP = new IPv6("1:0:0:4:0:0:0:8");
myIP.isIPv4(); // false
myIP.toString(); // "1:0:0:4::8" Collapses the longest string of zeros

// handles IPv4-mapped addresses
myIP = new IPv6("::FFFF:C0A8:2");
myIP.toIPv4String(); // "192.168.0.2"
myIP.toIPv6String(); // "::ffff:192.168.0.2" Trailing 'dot-decimal` format 
```
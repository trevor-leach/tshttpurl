import {IPv6} from './IPv6'

export class HttpURL
{
    private static pctXX = new RegExp('%([\\da-f]{2})', 'gi');
    private static qSep  = new RegExp('[^&;]+', 'g');
    private static regEx = new RegExp(
        '^\\s*'                                     + // leading whitespace
        '(?:(http|https):\\/\\/)?'                  + // 1 scheme
        '(?:((?:\\d{1,3}\\.){3}\\d{1,3})|'          + // 2 ipv4
        '(?:\\[([:\\.\\da-f]+)\\])|'                + // 3 ipv6
        '((?:(?:\\w\\.)|(?:\\w[\\w-]*\\w\\.))*'     + // 4 subdomains
            // allow leading digits in tld (if usr doesn't type fqdn)
            //'(?:[a-z]|(?:[a-z][\\w-]*\\w))))'     + // 4 tld
            '(?:\\w|(?:\\w[\\w-]*\\w))))'           + // 4 tld
        '(?::(-?\\d{1,10}))?'                       + // 5 port
        '(?:\\/((?:(?:%[\\da-f]{2})|[-\\w_\\.!~*\'():&=+\\$,/])*))?'       + // 6 path
        '(?:\\?((?:(?:%[\\da-f]{2})|[-\\w_\\.!~*\'();&=+\\$,/?:@[\\]])*))?'+ // 7 query
            '(?:#((?:(?:%[\\da-f]{2})|[-\\w_\\.!~*\'();&=+\\$,/?:@[\\]])*))?'+ // 8 fragment
        '\\s*$',                                      // trailing whitespace
        'i');

    public readonly scheme:     'https' | 'http';
    public readonly ipAddress?: IPv6
    public readonly host:       string;
    public readonly port:       number;
    public readonly path:       Array<string>;
    public readonly query:      Array<QueryParam> = [];
    public readonly fragment?:  string;
    public readonly isDir:      boolean;

    constructor(url: string) {

        // normalize the percent-ecoded triplets.
        url = String(url).replace(HttpURL.pctXX, (match, hexNum, offset, str) => {

            hexNum = parseInt(hexNum, 16);

            // decode unreserved characters
            if ((0x41 <= hexNum && hexNum <= 0x5A) ||   // [A-Z]
                (0x61 <= hexNum && hexNum <= 0x7A) ||   // [a-z]
                (0x30 <= hexNum && hexNum <= 0x39) ||   // [0-9]
                0x2D === hexNum                    ||   // hyphen
                0x2E === hexNum                    ||   // period
                0x5F === hexNum                    ||   // underscore
                0x7E === hexNum                      ) {// tilde

                return decodeURIComponent(match);
            }

            // make all hex uppercase. %5b => %5B
            return match.toUpperCase();
        });
        
        let parts = HttpURL.regEx.exec(url);

        if (null == parts) {
            throw new Error('Invalid URL');
        }

        this.scheme = parts[1] ? parts[1].toLowerCase() as ('https' | 'http') : 'http';

        if (parts[2]) {
            this.ipAddress = new IPv6(parts[2]);
            this.host      = this.ipAddress.toString();
        } else if (parts[3]) {
            this.ipAddress = new IPv6(parts[3]);
            this.host      = this.ipAddress.toString();
        } else {
            this.host = parts[4].toLowerCase();
        }

        if (parts[5]) {
            this.port = parseInt(parts[5], 10);

            if (this.port < 0 || 65535 < this.port) {
                throw new Error('Invalid port');
            }
        } else {
            this.port = ('http' === this.scheme) ? 80 : 443;
        }
        
        // normalize the path (remove ./, ../, //) & check path doesn't reference above parent (/foo/../../..)
        let pathStack: Array<string> = [];
        let segment: string;

        if (parts[6]) {
            this.path = parts[6].split('/');

            for (let i = 0; i < this.path.length; i += 1) {
                segment = this.path[i];
                if (segment && '.' !== segment) {

                    if ('..' === segment) {
                        if (undefined === pathStack.pop()) {
                            throw new Error('Invalid path');
                        };
                    } else {
                        pathStack.push(segment);
                    }
                }
            }

            this.path = pathStack;
            
        } else {
            this.path = [];
        }

        this.isDir =  0 === this.path.length ||
                '/' === parts[6].charAt(parts[6].length-1) ;

        if (parts[7]) {
            let queries = parts[7].match(HttpURL.qSep);

            if (queries) queries.forEach(q => this.query.push(new QueryParam(q)));
            this.query.sort(QueryParam.compare);
        }

        if (parts[8]) {
            this.fragment = parts[8];
        }
    }

    toString(): string {
        let theHost: string = this.host
        if (this.ipAddress && !this.ipAddress.isIPv4()) {
            theHost = `[${this.host}]`
        }
        const str: string = `${this.scheme}://${theHost}:${this.port}`
            + this.path.length ? this.path.join('/') : ''
            + this.isDir ? '/' : ''
            + this.query.length ? `?${this.query.join('&')}` : ''
            + this.fragment || '';

        this.toString = () => str; // memoize the string representation

        return str;
    }

    static compare(a: Object, b: Object): number {

        let ua = a instanceof HttpURL ? a : new HttpURL(a.toString());
        let ub = b instanceof HttpURL ? b : new HttpURL(b.toString());

        return ua < ub
                ? -1
                : (ua > ub ? 1 : 0);
    }
    }

    export class QueryParam
    {
    constructor(readonly name: string, readonly value?: string) {

        let eqIdx = name.indexOf('=');

        if (0 <= eqIdx) {
            if (value) throw new Error('Value specified with in name and value parameters.');

            name  = name.substr(0, eqIdx);
            value = name.substr(eqIdx + 1);
        }
    };

    toString(): string {

        return this.value ? `${this.name}=${this.value}` : this.name;
    };

    static compare(a: Object, b: Object): number {

        let qa = a instanceof QueryParam ? a : new QueryParam(a.toString());
        let qb = b instanceof QueryParam ? b : new QueryParam(b.toString());

        let an = qa.name,
            av = qa.value || '',
            bn = qb.name,
            bv = qb.value || '',

            comp = an < bn ? -1 : (an > bn ? 1 : 0);

        if (0 === comp) {
            comp = av < bv ? -1 : (av > bv ? 1 : 0);
        }

        return comp;
    };
}
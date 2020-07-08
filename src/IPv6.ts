export class IPv6
{
    private static readonly MAX        : bigint = (2n**128n) - 1n;
    private static readonly IPV4PREFIX : bigint = 0xFFFF00000000n;
    private static readonly IPV4MASK   : bigint = 0xFFFFffffFFFFffffFFFFffff00000000n;
    private static readonly ZERO       : bigint = 0n;
    private static readonly HEX4REGEX  : RegExp = /[0-9a-f]{4}/gi;
    private static readonly HEX2REGEX  : RegExp = /[0-9a-f]{2}/gi;
    private static readonly HEXREGEX   : RegExp = /^(\d|[a-f])+$/i;
    private static readonly DECREGEX   : RegExp = /^\d+$/i;
    private static readonly SPACEREGEX : RegExp = /\s+/;
    private static readonly COLONSREGEX: RegExp = /::/g;
    private static readonly COLONREGEX : RegExp = /:/g;

    private value: bigint;

    /**
     * 
     * @param value The object from which to create the new instance. E.g.
     * ```ts
     *  "192.168.0.1"
     *  "::FFFF:192.168.0.1"
     *  "fe80:0:0:0:202:b3ff:fe1e:8329"
     *   0xfe800000000000000202b3fffe1e8329n
     *   0xFFFF08080808n  // "8.8.8.8"
     * ```
     */
    public constructor(value: IPv6|bigint|string)
    {
        value = IPv6.toBigInt(value);

        if (IPv6.MAX < value) {

            throw new RangeError('value has more than 128 bits');

        } else if (value < IPv6.ZERO) {

            throw new RangeError('value is negative');
        }

        this.value = value
    };

    /**
     * Parses a hexidecimal string.
     * @param value String made up only of hexidecimal digits
     * @returns number represented by `value`
     * @throws RangeError if the whole string isn't parsed.
     */
    private static parseHex(value: string): number
    {
        if (IPv6.HEXREGEX.test(value)) {

            let i = parseInt(value, 16);

            if (isFinite(i)) {

                return i;
            }
        }

        throw new RangeError('value is not a hexidecimal digit');
    };

     /**
     * Parses a decimal string.
     * @param value String made up only of decimal digits
     * @returns number represented by `value`
     * @throws RangeError if the whole string isn't parsed.
     */
    private static parseDecimal(value: string): number
    {
        if (IPv6.DECREGEX.test(value)) {

            let i = parseInt(value, 10);

            if (isFinite(i)) {

                return i;
            }
        }

        throw new RangeError('value is not a decimal digit');
    };

    /**
     * Gets the number of times the specified RegExp matches a specified string.
     * 
     * @param subStr Regular Expression to search for.  Should have
     *               the 'g' flag specified so multiple matches are made.
     * @param superStr The String in which to search.
     * @returns the number of times `subStr` appears in `superStr`
     */
    private static matchCount(subStr: RegExp, superStr: string): number
    {
        let matchArray = superStr.match(subStr);
        return null === matchArray ? 0 : matchArray.length;
    }

    /**
     * Casts the value to an IPv6 instance.
     * @param value Value to cast.
     * @returns the supplied value if it is already an IPv6, otherwise a new
     *          IPv6 constructed from it.
     * @throws RangeError if a negative or >128 bit bigint is passed, or an
     *         Error if string that can not be parsed is passed.
     */
    public static from(value: IPv6|bigint|string): IPv6
    {
        return value instanceof IPv6 ? value : new IPv6(value);
    }

    /**
     * Casts the given object to a bigint.
     * @param value bigint, IPv6, or IPv6 formatted string to cast to a bigint.
     * @returns bigint
     */
    private static toBigInt(value: IPv6|bigint|string): bigint
    {
        if (null == value) {
            throw new Error('missing parameter');
        }

        if (value instanceof IPv6) {
            value = value.value;
        } else if ('string' == typeof value) {
            value = IPv6.fromString(value);
        }
        
        return value;
    }

    /**
     * Helper function that parses an IPv6 string to a bigint
     * @param value String representing an IPv6 Address
     * @throws Error if the string can't be parsed
     * @returns bigint
     */
    private static fromString(value: string): bigint
    {
        value = value.replace(IPv6.SPACEREGEX, '');
        let hasIPv4 = 0 < value.lastIndexOf('.');

        if (value.indexOf(':') < 0) {
            // IPv4 specified, turn it into IPv6 representation of IPv4.
            value = '::FFFF:' + value;

            if (!hasIPv4) {
                throw new Error("Invalid address");
            }
        }

        let colonColons: number = IPv6.matchCount(IPv6.COLONSREGEX, value);

        if (1 < colonColons) {

            throw new Error('too many "::" in the IPv6 string');

        } else if (1 === colonColons) {

            let colons       = IPv6.matchCount(IPv6.COLONREGEX, value);
            let missingParts = (hasIPv4 ? 7 : 8) - colons;
            let replacement  = ':';

            for (let i = 0; i < missingParts; i += 1) {
                replacement += '0:';
            }

            value = value.replace(IPv6.COLONSREGEX, replacement);
        }

        if (0 === value.indexOf(':')) {

            value = '0' + value;
        }

        if (':' === value.charAt(value.length - 1)) {

            value += '0';
        }

        let hexStr = "";
        let parts  = value.split(':');
        let intVal = -1;

        if (hasIPv4) {

            let quads = parts.pop()!.split('.');

            if (4 !== quads.length) {
                throw new Error('Invalid IP v 4 address');
            }

            for (let i = 0; i < 4; i += 1) {

                try {
                    intVal = IPv6.parseDecimal(quads[i]);
                } catch (e) {
                    throw new Error('Invalid IP v 4 address: ' + e);
                }

                if (intVal < 0 || 255 < intVal) {
                    throw new Error('Invalid IP v 4 address');
                }

                hexStr += intVal.toString(16).padStart(2, '0');
            }
        }

        if (8 != (hexStr.length/4) + parts.length) {
            throw new Error("Invalid address");
        }

        for (let part = parts.pop(); part; part = parts.pop()) {

            try {
                intVal = IPv6.parseHex(part);
            } catch (e) {
                throw new Error('Invalid IP v 6 address: ' + e);
            }

            if (intVal < 0 || 0xFFFF < intVal) {
                throw new Error('Invalid IP v 6 address');
            }

            hexStr = intVal.toString(16).padStart(4, '0') + hexStr;
        }

        return BigInt("0x" + hexStr);
    };

    /**
     * Determines if the object represents an IP v 4 address or not.
     * ```ts
     *  IPv6.isIPv4("10.0.0.1")         // true
     *  IPv6.isIPv4("::ffff:a00:1")     // true
     *  IPv6.isIPv4(" 2001:db8:a::123") // false
     * ```
     * @param ipv6 The object to test.
     */
    public static isIPv4(ipv6: IPv6|bigint|string): boolean
    {
        return IPv6.IPV4PREFIX === (IPv6.IPV4MASK & IPv6.toBigInt(ipv6));
    }

    /**
     * Determines if the object represents an IP v 4 address or not.
     * ```ts
     *    (new IPv6("10.0.0.1")        ).isIPv4();  // true
     *    (new IPv6("::ffff:a00:1")    ).isIPv4();  // true
     *    (new IPv6(" 2001:db8:a::123")).isIPv4();  // false
     * ```
     * @returns true if this is an IP v 4 address, false otherwise.
     */
    public isIPv4(): boolean
    {
        const isV4 = IPv6.isIPv4(this);

        this.isIPv4 = function() { return isV4; };

        return isV4;
    };

    /**
     * Gets the [canonical](https://en.wikipedia.org/wiki/IPv6_address#Recommended_representation_as_text)
     * IP v 6 representation of an IP Address. I.e. Lower case, without leading zeros and the left-most
     * largest set of consecutive zero parts collapsed to a double colon:
     * ```ts
     *     "::ffff:192.168.0.1"
     *     "2001:db8::1:0:0:1"
     * ```
     * @param ipv6 The object representing the IPv6 address.
     * @param dotDec For [IPv4-mapped](https://en.wikipedia.org/wiki/IPv6#IPv4-mapped_IPv6_addresses),
     *        indicates whether to use the 'dot-decimal' notation for the IPv4 part.
     *        Defaults to true. For example:
     * ```ts
     *  IPv6.toIPv6String("10.0.0.1")        // "::ffff:10.0.0.1"
     *  IPv6.toIPv6String("10.0.0.1", false) // "::ffff:a00:1"
     * ```
     * @returns The compact IP v 6 representation of this IP Address.
     */
    public static toIPv6String(ipv6: IPv6|bigint|string, dotDec: boolean=true): string
    {
        ipv6 = IPv6.from(ipv6)
        let ipv6Str = '';

        if (ipv6.isIPv4() && dotDec) {
            ipv6Str = '::ffff:' + ipv6.toIPv4String();

        } else {
            let hexStr  = ipv6.value.toString(16).padStart(32, '0');
            let hexStrs = hexStr.match(IPv6.HEX4REGEX) || [];
            let intParts:       number[] = [];
            let current_streak: number = 0;
            let current_start:  number = -1;
            let longest_streak: number = 0;
            let longest_start:  number = -1;

            // remove leading zeros of each part.
            for (let i = 0; i < 8; i++) {
                let part = parseInt(hexStrs[i], 16);
                intParts[i] = part;

                if (0 === part) {
                    current_streak++;
                    if (current_start < 0) {
                        current_start = i;
                    }
                    if (current_streak > longest_streak) {
                        longest_streak = current_streak;
                        longest_start  = current_start;
                    }
                } else {
                    current_start  = -1;
                    current_streak = 0;
                }
            }

            if (longest_streak <= 1) {
                ipv6Str = hexStrs.join(':');
            } else {
                // collapse the longest streak of zero parts to '::'
                if (0 ===longest_start) {
                    ipv6Str = ':';
                }
                for (let i = 0; i < longest_start; i++) {
                    ipv6Str += intParts[i].toString(16) + ':'
                }
                for (let i = longest_start + longest_streak; i < 8; i++) {
                    ipv6Str += ':' + intParts[i].toString(16);
                }
                if (longest_start + longest_streak === 8) {
                    ipv6Str += ':'
                }
            }
            // ipv6Str = ipv6Str.replace(/((^0:)|:)(0:)+(0$)?/,  '::');
        }

        return ipv6Str;
    }

    /**
     * Gets the [canonical](https://en.wikipedia.org/wiki/IPv6_address#Recommended_representation_as_text)
     * IP v 6 representation of an IP Address. I.e. Lower case, without leading zeros and the left-most
     * largest set of consecutive zero parts collapsed to a double colon:
     * ```ts
     *     "::ffff:192.168.0.1"
     *     "2001:db8::1:0:0:1"
     * ```
     * @param dotDec For [IPv4-mapped](https://en.wikipedia.org/wiki/IPv6#IPv4-mapped_IPv6_addresses),
     *        indicates whether to use the 'dot-decimal' notation for the IPv4 part.
     *        Defaults to true. For example:
     * ```ts
     *  (new IPv6("10.0.0.1")).toIPv6String()      // "::ffff:10.0.0.1"
     *  (new IPv6("10.0.0.1")).toIPv6String(false) // "::ffff:a00:1"
     * ```
     * @returns The compact IP v 6 representation of this IP Address.
     */
    public toIPv6String(dotDec: boolean=true): string
    {
        return IPv6.toIPv6String(this, dotDec); //TODO: memoize for each value of dotDec
    };

    /**
     * Gets the IP v 4 "dot-decimal" representation of an IP address, if it
     * represents an IP v 4 address. E.g.
     * ```ts
     *     "192.168.0.1"
     * ```
     * @returns The "dot-decimal" representation of this IP Address.
     * 
     * @throws an Error if ipv6 isn't an IP v 4 address. (if isIPv4() === false)
     */
    public static toIPv4String(ipv6: IPv6|bigint|string): string
    {
        ipv6 = IPv6.from(ipv6)

        if (ipv6.isIPv4()) {

            let hexStrs = (ipv6.value.toString(16)).match(IPv6.HEX2REGEX) || [];
            let ints    = hexStrs.slice(-4);

            for (let i = 0; i < 4; i += 1) {
                ints[i] = parseInt(ints[i], 16).toString(10);
            }

            return ints.join('.');
        }

        throw new Error('Not an IPv4 address:  "' + ipv6.toString() + '"');
    }

    /**
     * Gets the IP v 4 "dot-decimal" representation of this IP address, if this
     * address represents an IP v 4 address. E.g.
     * ```ts
     *     "192.168.0.1"
     * ```
     * 
     * @returns The "dot-decimal" representation of this IP Address.
     * 
     * @throws an Error if this isn't a IP v 4 address. (if isIPv4() === false)
     */
    public toIPv4String(): string
    {
        let ipv4Str = IPv6.toIPv4String(this);

        this.toIPv4String = function () {return ipv4Str; };

        return ipv4Str;
    };

    /**`
     * @returns returns the IP v 4 "dot-decimal" representation if
     *          isIPv4() == true, otherwise the IP v 6 formatted version.
     */
    public toString(): string
    {
        return this.isIPv4()
                ? this.toIPv4String()
                : this.toIPv6String();
    };

    /**
     * Compares this IP Address to another for order.
     * @param first  The first address to compare
     * @param second The second address to compare
     * @returns A negative integer, zero, or a positive integer as first
     *          is less than, equal to, or greater than second.
     * @throws an Error if either parameter is a string that can not be parsed.
     */
    public static compare(first:IPv6|bigint|string, second: IPv6|bigint|string): number
    {
        first  = IPv6.toBigInt(first);
        second = IPv6.toBigInt(second);

        return first < second ?
            -1 : (first > second ? 1 : 0);
    }

    /**
     * Compares this IP Address to another for order.
     * @param other The address to use as a comparison.
     * 
     * @returns A negative integer, zero, or a positive integer as this
     *          is less than, equal to, or greater than other.
     * @throws an Error if other is a string that can not be parsed.
     */
    public compare(other: IPv6|bigint|string): number
    {
        return IPv6.compare(this, other);
    }

    /**
     * Determines whether the arguments represent the same address
     * @param first  The first address to use as a comparison.
     * @param second The second address to use as a comparison.
     * @returns boolean
     */
    public static equals(
            first:  IPv6|bigint|string|null,
            second: IPv6|bigint|string|null): boolean
    {
        let equal: boolean = false;

        if (null == first) {
            equal = null == second;
        } else if (second != null) {
            try {
                equal = 0 == IPv6.compare(first, second);
            } catch (Error) {
                // use default of `false`
            }
        }

        return equal;
    }

    /**
     * Determines whether the passed in value represents the same value as 
     * this instance
     * @param other The address to use as a comparison.
     *        null or malformed addresses result in false being returned.
     * @returns boolean
     */
    public equals(other: IPv6|bigint|string|null): boolean
    {
        return IPv6.equals(this, other);
    }
}
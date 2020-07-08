import 'mocha'
import {expect} from 'chai'
import {IPv6} from '../src/IPv6'

describe('IPv6', () => {

    let ips: string[] = [];
    let ipv6: IPv6    =  new IPv6(1n);

    beforeEach(() => {
        ipv6 = new IPv6(1n);
        ips  = ['::1',
                '192.168.0.1',
                '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
                'fe80:0:0:0:202:b3ff:fe1e:8329',
                'fe80::202:b3ff:fe1e:8329',
                '::FFFF:10.0.0.1',
                '::FFFF:a00:1',
                '0::FFFF:10.0.0.1',
                '0000::0:FFFF:a00:1',
                'fe80:0:0:0:202:0:0:8329',
                'fe80:0:0:202:0:0:0:8329',
                'fe80:0:0:1:202:0:0:8329'];
    })

    describe('constructor', () => {

        it('should construct properly from good strings', () => {
            expect(new IPv6(ips[0]).toIPv6String()).to.equal(ips[0]);
            expect(new IPv6(ips[1]).toIPv4String()).to.equal(ips[1]);
            expect(new IPv6(ips[2]).toIPv6String()).to.equal('2001:db8:85a3::8a2e:370:7334');
            expect(new IPv6(ips[3]).toIPv6String()).to.equal('fe80::202:b3ff:fe1e:8329');
            expect(new IPv6(ips[4]).toIPv6String()).to.equal('fe80::202:b3ff:fe1e:8329');
            expect(new IPv6(ips[5]).toIPv6String()).to.equal('::ffff:10.0.0.1');
            expect(new IPv6(ips[6]).toIPv6String()).to.equal('::ffff:10.0.0.1');
            expect(new IPv6(ips[7]).toIPv6String()).to.equal('::ffff:10.0.0.1');
            expect(new IPv6(ips[8]).toIPv6String()).to.equal('::ffff:10.0.0.1');
            expect(new IPv6(ips[9]).toIPv6String()).to.equal('fe80::202:0:0:8329');
            expect(new IPv6(ips[10]).toIPv6String()).to.equal('fe80:0:0:202::8329');
            expect(new IPv6(ips[11]).toIPv6String()).to.equal('fe80::1:202:0:0:8329');
            expect(new IPv6('::').toIPv6String()).to.equal('::');
            expect(new IPv6('2000::').toIPv6String()).to.equal('2000::');
            expect(new IPv6('2000::ffff').toIPv6String()).to.equal('2000::ffff');
        })

        it('should reject malformed strings during construction', () => {
            expect( () => new IPv6('192') ).to.throw("Invalid address");
            expect( () => new IPv6('a') ).to.throw("Invalid address");
            expect( () => new IPv6('foobar') ).to.throw("Invalid address");
            expect( () => new IPv6('::ffff:192.168') ).to.throw("Invalid IP v 4 address");
            expect( () => new IPv6('.0.0.1') ).to.throw("Invalid IP v 4 address");
            expect( () => new IPv6('192.168.0.1Derp') ).to.throw("Invalid IP v 4 address");
            expect( () => new IPv6('10.0.a.b') ).to.throw("Invalid IP v 4 address");
            expect( () => new IPv6('a::b::1:2') ).to.throw('too many "::" in the IPv6 string');
            expect( () => new IPv6('10.0.0.0.1') ).to.throw("Invalid IP v 4 address");
            expect( () => new IPv6('a:a:a:a:a:a:a:a:a') ).to.throw("Invalid address");
            expect( () => new IPv6('10.0.0.1a') ).to.throw("Invalid IP v 4 address");
            expect( () => new IPv6('10.0.260.1') ).to.throw("Invalid IP v 4 address");
        })

        it('should construct properly from another IPv6', () => {
            expect(new IPv6(ipv6).toIPv6String()).to.equal(ips[0]);
        })

        it('should construct properly from a good bigint', () => {
            expect(new IPv6(0n).toIPv6String()).to.equal('::');
            expect(new IPv6(1n).toIPv6String()).to.equal(ips[0]);
            expect(new IPv6(0xfe800000000000000202b3fffe1e8329n).toIPv6String())
                .to.equal('fe80::202:b3ff:fe1e:8329');
        })

        it('should reject out-of-range bigints during construction', () => {
            expect( () => new IPv6(-1n) ).to.throw(RangeError, 'value is negative');
            expect( () => new IPv6(2n**128n) ).to.throw(RangeError, 'value has more than 128 bits')
        })

        it('should reject null or missing constructor argument', () => {
            let arg: string|null|undefined;
            expect('undefined').to.equal(typeof arg);
            expect( () => new IPv6(arg as string) ).to.throw('missing parameter');
            arg = null;
            expect( () => new IPv6(arg as string) ).to.throw('missing parameter');
        })
    })

    describe('static from', () => {
        it('should return the IPv6 instance passed', () => {
            expect(IPv6.from(ipv6)).to.equal(ipv6)
        })

        it('should work with a bigint', () => {
            expect(IPv6.from(1n).toIPv6String()).to.equal(ips[0]);
        })

        it('should work with a string', () => {
            expect(IPv6.from(ips[0]).toIPv6String()).to.equal(ips[0]);
        })

        it('should reject bad bigints with a RangeError', () => {
            expect( () => IPv6.from(-1n) ).to.throw(RangeError)
        })

        it('should reject bad strings with an Error', () => {
            expect( () => IPv6.from('10.1.1.270') ).to.throw(Error)
        })
    })

    describe('isIPv4 (static)', () => {
        it('should say IPv6 addresses are not IPv4', () => {
            expect(IPv6.isIPv4(ipv6)).to.be.false;

            ipv6 = new IPv6(ips[2]);
            expect(IPv6.isIPv4(ips[2])).to.be.false;

            expect(IPv6.isIPv4(0xa00001n)).to.be.false;
        })

        it('should say IPv4-mapped addresses are IPv4', () => {
            ipv6 = new IPv6(ips[1]);
            expect(IPv6.isIPv4(ipv6)).to.be.true;
            
            expect(IPv6.isIPv4(ips[5])).to.be.true;

            expect(IPv6.isIPv4(0xFFFF08080808n)).to.be.true;
        })
    })

    describe('isIPv4', () => {
        it('should say IPv6 addresses are not IPv4', () => {
            expect(ipv6.isIPv4()).to.be.false;
            expect(ipv6.isIPv4()).to.be.false; // memoized value.

            ipv6 = new IPv6(ips[2]);
            expect(ipv6.isIPv4()).to.be.false;
            expect(ipv6.isIPv4()).to.be.false;

            ipv6 = new IPv6(0xa00001n);
            expect(ipv6.isIPv4()).to.be.false;
            expect(ipv6.isIPv4()).to.be.false;
        })

        it('should say IPv4-mapped addresses are IPv4', () => {
            ipv6 = new IPv6(ips[1]);
            expect(ipv6.isIPv4()).to.be.true;
            expect(ipv6.isIPv4()).to.be.true;

            ipv6 = new IPv6(ips[5]);
            expect(ipv6.isIPv4()).to.be.true;
            expect(ipv6.isIPv4()).to.be.true;

            ipv6 = new IPv6(ips[6]);
            expect(ipv6.isIPv4()).to.be.true;
            expect(ipv6.isIPv4()).to.be.true;
        })
    })

    describe('toIPv6String (static)', () => {
        it('should accept an IPv6 and collapse leading zero parts', () => {
            expect(IPv6.toIPv6String(ipv6)).to.equal('::1');
        })

        it('should accept a string and default to "dot-decimal" for IPv4 part', () => {
            expect(IPv6.toIPv6String('192.168.0.1')).to.equal('::ffff:192.168.0.1')
        })

        it('should accept a string and allow override of "dot-decimal" for IPv4 part', () => {
            expect(IPv6.toIPv6String('10.0.0.1', false)).to.equal('::ffff:a00:1')
        })

        it('should accept a bigint and collapse leading zero parts', () => {
            expect(IPv6.toIPv6String(10n)).to.equal('::a');
        })

        it('should only collapse the leftmost string of zero parts, if equal length', () => {
            expect(IPv6.toIPv6String("1:0:0:4:0:0:7:8")).to.equal('1::4:0:0:7:8');
        })

        it('should only collapse the longer string of zero parts', () => {
            expect(IPv6.toIPv6String("1:0:0:4:0:0:0:8")).to.equal("1:0:0:4::8");
        })

        it('should properly collapse a trailing string of zero parts', () => {
            expect(IPv6.toIPv6String("1:2:3:4:0:0:0:0")).to.equal("1:2:3:4::");
        })

        it('should properly return the unspecified address as "::"', () => {
            expect(IPv6.toIPv6String(0n)).to.equal("::");
        })
    })

    describe('toIPv6String', () => {
        it('should accept an IPv6 and collapse leading zero parts', () => {
            expect(ipv6.toIPv6String()).to.equal('::1');
        })

        it('should default to "dot-decimal" for IPv4 part and then allow override', () => {
            ipv6 = new IPv6('192.168.0.1');
            expect(ipv6.toIPv6String()).to.equal('::ffff:192.168.0.1');
            expect(ipv6.toIPv6String(false)).to.equal('::ffff:c0a8:1');
        })

        it('should override of "dot-decimal" for IPv4 part and revert to defalut', () => {
            ipv6 = new IPv6('10.0.0.1');
            expect(ipv6.toIPv6String(false)).to.equal('::ffff:a00:1');
            expect(ipv6.toIPv6String()).to.equal('::ffff:10.0.0.1');
        })

        it('should accept a bigint and collapse zero parts', () => {
            ipv6 = new IPv6(10n);
            expect(ipv6.toIPv6String()).to.equal('::a');
        })

        it('should only collapse the leftmost string of zero parts, if equal length', () => {
            ipv6 = new IPv6("1:0:0:4:0:0:7:8");
            expect(ipv6.toIPv6String()).to.equal('1::4:0:0:7:8');
        })

        it('should only collapse the longer string of zero parts', () => {
            ipv6 = new IPv6("1:0:0:4:0:0:0:8");
            expect(ipv6.toIPv6String()).to.equal("1:0:0:4::8");
            ipv6 = new IPv6("1:0:0:0:4:0:0:8");
            expect(ipv6.toIPv6String()).to.equal("1::4:0:0:8");
        })

        it('should properly collapse a trailing string of zero parts', () => {
            ipv6 = new IPv6("1:2:3:4:0:0:0:0");
            expect(ipv6.toIPv6String()).to.equal("1:2:3:4::");
        })

        it('should properly return the unspecified address as "::"', () => {
            ipv6 = new IPv6(0n);
            expect(ipv6.toIPv6String()).to.equal("::");
        })
    })

    describe('toIPv4String (static)', () => {
        it('should thow if IPv6 instance not an IPv4 address', () => {
            expect( () => IPv6.toIPv4String(ipv6)).to.throw(Error, 'Not an IPv4 address:  "::1"')
        })

        it('should accept an IPv4-mapped IPv6 and return the "dot-decimal" representation', () =>{
            ipv6 = new IPv6("::FFFF:192.168.0.1")
            expect(IPv6.toIPv4String(ipv6)).to.equal('192.168.0.1');
        })

        it('should accept an IPv4-mapped string and return the "dot-decimal" representation', () =>{
            expect(IPv6.toIPv4String("::FFFF:192.168.0.2")).to.equal('192.168.0.2');
            expect(IPv6.toIPv4String("192.168.0.2")).to.equal('192.168.0.2');
            expect(IPv6.toIPv4String("::FFFF:C0A8:2")).to.equal('192.168.0.2');
        })

        it('should accept an IPv4-mapped biginit and return the "dot-decimal" representation', () =>{
            expect(IPv6.toIPv4String(0xffffc0a80003n)).to.equal('192.168.0.3');
        })
    })

    describe('toIPv4String', () => {
        it('should thow if IPv6 instance not an IPv4 address', () => {
            expect( () => ipv6.toIPv4String()).to.throw(Error, 'Not an IPv4 address:  "::1"')
        })

        it('should accept an IPv4-mapped IPv6 and return the "dot-decimal" representation', () =>{
            ipv6 = new IPv6("::FFFF:192.168.0.1")
            expect(ipv6.toIPv4String()).to.equal('192.168.0.1');
        })

        it('should accept an IPv4-mapped string and return the "dot-decimal" representation', () =>{
            ipv6 = new IPv6("::FFFF:192.168.0.2");
            expect(ipv6.toIPv4String()).to.equal('192.168.0.2');
            expect(ipv6.toIPv4String()).to.equal('192.168.0.2'); // memoized value

            ipv6 = new IPv6("192.168.0.2");
            expect(ipv6.toIPv4String()).to.equal('192.168.0.2');
            expect(ipv6.toIPv4String()).to.equal('192.168.0.2');

            ipv6 = new IPv6("::FFFF:C0A8:2");
            expect(ipv6.toIPv4String()).to.equal('192.168.0.2');
            expect(ipv6.toIPv4String()).to.equal('192.168.0.2');
        })

        it('should accept an IPv4-mapped biginit and return the "dot-decimal" representation', () =>{
            ipv6 = new IPv6(0xffffc0a80003n);
            expect(ipv6.toIPv4String()).to.equal('192.168.0.3');
        })
    })

    describe('toString', () => {
        it('should return the IPv6 representation', () => {
            expect(ipv6.toString()).to.equal('::1');
        })

        it('should return the IPv4 "dot-decimal" representation', () => {
            ipv6 = new IPv6('192.168.0.1');
            expect(ipv6.toString()).to.equal('192.168.0.1');
        })
    })

    describe('compare (static)', () => {
        it('should return <0 when first arg is lesser', () => {
            expect(IPv6.compare(ipv6, 10n)).to.be.lessThan(0);
        })

        it('should return >0 when first arg is greater', () => {
            expect(IPv6.compare("::FF", ipv6)).to.be.greaterThan(0);
        })

        it('should return 0 when args represent the same address', () => {
            expect(IPv6.compare("192.168.0.1", "::ffff:c0a8:1")).to.equal(0);
        })
    })

    describe('compare', () => {
        it('should return <0 when arg is greater', () => {
            expect(ipv6.compare(10n)).to.be.lessThan(0);
        })

        it('should return >0 when arg is lesser', () => {
            ipv6 = new IPv6("::ff");
            expect(ipv6.compare(0xFAn)).to.be.greaterThan(0);
        })

        it('should return 0 when arg represents the same address', () => {
            ipv6 = new IPv6("192.168.0.1");
            expect(ipv6.compare("::ffff:c0a8:1")).to.equal(0);
            expect(ipv6.compare(ipv6)).to.equal(0);
        })
    })

    describe('equals (static)', () => {
        it('should return true if both arguments are null', () => {
            expect(IPv6.equals(null, null)).to.be.true;
        })

        it('should return false if only the first argument is null', () => {
            expect(IPv6.equals(null, 1n)).to.be.false;
        })

        it('should return false if only the second argument is null', () => {
            expect(IPv6.equals('::1', null)).to.be.false;
        })

        it('should return false if the arguments represent different addresses', () => {
            expect(IPv6.equals('::1', 2n)).to.be.false;
        })

        it('should return true if the arguments represent the same address', () => {
            expect(IPv6.equals('::1', 1n)).to.be.true;
            expect(IPv6.equals(ipv6, 1n)).to.be.true;
            expect(IPv6.equals('10.0.0.1', 0xffff0a000001n)).to.be.true;
        })
    })

    describe('equals', () => {
        it('should return false if the argument is null', () => {
            expect(ipv6.equals(null)).to.be.false;
        })

        it('should return false if the arguments represent different addresses', () => {
            expect(ipv6.equals(2n)).to.be.false;
        })

        it('should return true if the arguments represent the same address', () => {
            expect(ipv6.equals(1n)).to.be.true;
            expect(ipv6.equals('::1')).to.be.true;
            expect(ipv6.equals(ipv6)).to.be.true;
            ipv6 = new IPv6('10.0.0.1')
            expect(ipv6.equals(0xffff0a000001n)).to.be.true;
        })
    })
})
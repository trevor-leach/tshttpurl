import 'mocha'
import {expect} from 'chai'
import {HttpURL, QueryParam} from '../src/HttpURL'
import {testThat} from './TestUtils'

describe('HttpURL', () => {

    it('should parse the scheme correctly and normalize to lower case', () => {

        expect(new HttpURL('http://a').scheme).to.equal('http');
        expect(new HttpURL('HTTP://a').scheme).to.equal('http');
        expect(new HttpURL('https://a').scheme).to.equal('https');
        expect(new HttpURL('HTTPS://a').scheme).to.equal('https');
        expect(new HttpURL('a').scheme).to.equal('http');

        expect( () => new HttpURL('ftp://a')).to.throw;
    })

    it('should parse the host and normalize it to lower case', () => {
        expect(new HttpURL('http://a').host).to.equal('a');
        expect(new HttpURL('http://A').host).to.equal('a');
        expect(new HttpURL('http://www.google.com/search?q=javascript').host).to.equal('www.google.com');
        expect(new HttpURL('GOOGLE.COM/search?q=javascript').host).to.equal('google.com');
        expect(new HttpURL('google.com').host).to.equal('google.com');
        expect(new HttpURL('[::ffff:7f00:1]').host).to.equal('127.0.0.1');
        //expect(new HttpURL('[::ffff:7f00:1]').host).to.equal('::ffff:7f00:1');
        expect( () => new HttpURL('http://::ffff:7f00:1/')).to.throw();
        expect(new HttpURL('https://10.0.0.1').host).to.equal('10.0.0.1');
        expect( () => new HttpURL('[google.com]')).to.throw();
    });

    it('should parse the port or provide a default value', () => {
        expect(new HttpURL('http://foo.com:123/').port).to.equal(123);
        expect(new HttpURL('http://foo.com').port).to.equal(80);
        expect(new HttpURL('foo.com').port).to.equal(80);
        expect(new HttpURL('https://foo.com:4443').port).to.equal(4443);
        expect(new HttpURL('https://foo.com').port).to.equal(443);
        expect( () => new HttpURL('foo:-1/')).to.throw('Invalid port');
        expect( () => new HttpURL('foo:65536')).to.throw('Invalid port');
        expect( () => new HttpURL('foo:100000')).to.throw('Invalid port');
    });

    it('should parse the path and reject those that climb out', function () {
        expect(new HttpURL('http://a/').path).to.deep.equal([]);
        expect(new HttpURL('http://a').path).to.deep.equal([]);
        expect(new HttpURL('http://a/a/b/c/../../.././/#d').path).to.deep.equal([]);
        expect(new HttpURL('http://a/a/b/c/../../.././/d').path).to.deep.equal(['d']);
        expect(new HttpURL('foo.com/a/B/%64/CR%9a').path).to.deep.equal(['a','B','d','CR%9A']);
        expect(() => new HttpURL('foo.com/a/../../b')).to.throw('Invalid path');
    });

    it('should recognize when the path represents a directory', function () {
        expect(new HttpURL('http://a/').isDir).to.be.true;
        expect(new HttpURL('http://a').isDir).to.be.true;
        expect(new HttpURL('http://a/a/b/c/../../.././/#d').isDir).to.be.true;
        expect(new HttpURL('http://a/a/b/c/../../.././/d').isDir).to.be.false;
        expect(new HttpURL('http://a/a/b/c/../../.././/?').isDir).to.be.true;
    });

    it('should parse query params and order them', function () {
        let qCompare = QueryParam.compare;
        testThat(new HttpURL('http://a/').query).comparesInOrderTo([],qCompare);
        testThat(new HttpURL('http://a?').query).comparesInOrderTo([],qCompare);
        testThat(new HttpURL('http://a?#a').query).comparesInOrderTo([],qCompare);
        testThat(new HttpURL('a?b=c&a').query).comparesInOrderTo(['a','b=c'],qCompare);
        testThat(new HttpURL('a?b=c;a=;C=%64').query).comparesInOrderTo(['C=d','a','b=c'],qCompare);
    });
})
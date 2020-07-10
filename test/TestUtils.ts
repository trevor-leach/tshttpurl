import {assert} from "chai"

class TestUtils {

    private actual: any;

    constructor(actual: any) {
        this.actual = actual;
    }

    /**
     * Compares the expected array values for order and equality against
     * the actual array.
     * 
     * @param expected An indexed Array.
     * 
     * @param compareFn optional comparison function
     *        for the array elements.
     */
    public comparesInOrderTo<T, T1 extends T, T2 extends T>(
        expected: Array<T2>, 
        compareFn?:  (a:T, b:T)=>number ): void
    {
        const actual = (<Array<T1>> this.actual);
        assert.equal(this.actual.length, expected.length,
            `actual.length != expected.length`);
        
        actual.forEach((actuali, i) => {

            if (!expected.hasOwnProperty(i)) {
                assert.fail(`actual and expected do not both have element ${i}`)
            } else {
                if (compareFn) {
                    const comparison = compareFn(actual[i], expected[i]);
                    assert.strictEqual(0, comparison,
`
actual[${i}]:   ${actual[i]}
expected[${i}]: ${expected[i]}
compareFn(actual[${i}], expected[${i}]) returned ${comparison}`);
                } else {
                    assert.equal(this.actual[i], expected[i],
`
actual[${i}]:   ${actual[i]}
expected[${i}]: ${expected[i]}
actual[${i}] != expected[${i}]`);
                }
            }
        });
    };

    /**
     * Compares expected.toUpperCase() against actual.toUpperCase()
     * 
     * @param expected Converted to string with `toString()`
     */
    public equalsIgnoreCase(expected: any): void
    {
        assert.strictEqual(this.actual.toString().toUpperCase(), 
                    expected.toString().toUpperCase());
    };

    /**
     * Compares expected to actual using the specified comparison 
     * function.
     * 
     * @param {*} expected The value to compare to actual.
     * 
     * @param {function(*,*)} compareFn The comparison function with
     *        which to perform the comparison.
     */
    public comparesEquallyTo<T> (expected: T, compareFn:  (a:T, b:T)=>number ): void
    {
        const comparison = compareFn(this.actual as T, expected);
        assert.strictEqual( 0, comparison,
`
actual:   ${this.actual}
expected: ${expected}
compareFn(actual, expected) returned ${comparison}`);
    };
    
    /**
     * Compares expected to actual using the specified comparison 
     * function.
     * 
     * @param {*} expected The value to compare to actual.
     * 
     * @param {function(*,*)} compareFn The comparison function with
     *        which to perform the comparison.
     */
    public comparesLessThan<T> (expected: T, compareFn: (a:T, b:T)=>number): void
    {
        const comparison = compareFn(this.actual, expected)
        assert.isBelow(comparison, 0,
`
actual:   ${this.actual}
expected: ${expected}
compareFn(actual, expected) returned ${comparison}`);
    };

    /**
     * Compares expected to actual using the specified comparison 
     * function.
     * 
     * @param {*} expected The value to compare to actual.
     * 
     * @param {function(*,*)} compareFn The comparison function with
     *        which to perform the comparison.
     */
    public comparesGreaterThan<T> (expected: T, compareFn: (a:T, b:T)=>number): void
    {
        const comparison = compareFn(this.actual, expected)
        assert.isAbove(comparison, 0,
`
actual:   ${this.actual}
expected: ${expected}
compareFn(actual, expected) returned ${comparison}`);
    };
};

export function testThat(actual: any): TestUtils {
    return new TestUtils(actual);
}
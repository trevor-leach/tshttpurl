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
     *        
     * @return true if expected and acutal contain equal elements in the
     *         same order, false otherwise.
     */
    public comparesInOrderTo<T, T1 extends T, T2 extends T>(
        expected: Array<T2>, 
        compareFn?:  (a:T, b:T)=>number ): boolean
    {
        this.actual = <Array<T1>> this.actual;
        var isEqual = this.actual.length === expected.length;
        
        for (let i = this.actual.length -1; 0 <= i && isEqual; i -= 1) {

            let actualHas = this.actual.hasOwnProperty(i);

            if (actualHas !== expected.hasOwnProperty(i)) {
                isEqual = false;
            } else if (actualHas) {
                if (compareFn) {
                    isEqual = 0 === compareFn(this.actual[i], expected[i]);
                } else {
                    isEqual = Object.is(this.actual[i], expected[i]);
                }
            }
        }
        
        return isEqual;
    };

    /**
     * Compares expected.toUpperCase() against actual.toUpperCase()
     * 
     * @param expected Converted to string with `toString()`
     * 
     * @returns true if expected equals actual ignoring case, false
     *          otherwise.
     */
    public equalsIgnoreCase(expected: any): boolean
    {
        return this.actual.toString().toUpperCase() === 
                    expected.toString().toUpperCase();
    };

    /**
     * Compares expected to actual using the specified comparison 
     * function.
     * 
     * @param {*} expected The value to compare to actual.
     * 
     * @param {function(*,*)} compareFn The comparison function with
     *        which to perform the comparison.
     * 
     * @returns  0 == compareFn(actual, expected)
     */
    public comparesEquallyTo<T> (expected: T, compareFn:  (a:T, b:T)=>number ): boolean
    {
        return 0 == compareFn(this.actual as T, expected);
    };
    
    /**
     * Compares expected to actual using the specified comparison 
     * function.
     * 
     * @param {*} expected The value to compare to actual.
     * 
     * @param {function(*,*)} compareFn The comparison function with
     *        which to perform the comparison.
     * 
     * @returns  compareFn(actual, expected) < 0
     */
    public comparesLessThan<T> (expected: T, compareFn: (a:T, b:T)=>number): boolean
    {
        return compareFn(this.actual, expected) < 0;
    };

    /**
     * Compares expected to actual using the specified comparison 
     * function.
     * 
     * @param {*} expected The value to compare to actual.
     * 
     * @param {function(*,*)} compareFn The comparison function with
     *        which to perform the comparison.
     * 
     * @returns  0 < compareFn(actual, expected)
     */
    public comparesGreaterThan<T> (expected: T, compareFn: (a:T, b:T)=>number): boolean
    {
        return 0 < compareFn(this.actual, expected);
    };


    public isInstanceOf (type: Function) {
        
        return this.actual instanceof type;
    }

    /**
     * Equates actual to expected using the 'equals with coercion' operator `==`
     * rather than Chai's to.equal(any) use of strict equality `===`.
     * @param expected 
     * @returns actual == expected
     */
    public laxEquals (expected: any): boolean
    {
        return this.actual == expected;
    }
};

export function testThat(actual: any): TestUtils {
    return new TestUtils(actual);
}
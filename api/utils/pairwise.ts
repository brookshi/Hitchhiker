
export class PairwiseStrategy {

    static readonly instance: PairwiseStrategy = new PairwiseStrategy();

    GetTestCasesByObj(obj: _.Dictionary<any[]>) {
        const keys = Object.keys(obj);
        const source = new Array<Array<any>>();
        keys.forEach(k => {
            source.push(obj[k]);
        });
        const testCaseArr = this.GetTestCases(source);
        const testCases = new Array<any>();
        testCaseArr.forEach(t => {
            const testCase = {};
            testCases.push(testCase);
            t.forEach((l, i) => {
                testCase[keys[i]] = l;
            });
        });

        return testCases;
    }

    GetTestCases(sources: any[][]) {
        let testCases = new Array<any[]>();
        let valueSet = this.CreateValueSet(sources);
        let dimensions = this.CreateDimensions(valueSet);
        let pairwiseTestCases = new PairwiseTestCaseGenerator().GetTestCases(dimensions);

        for (let pairwiseTestCase of pairwiseTestCases) {
            let testData = new Array<any>(pairwiseTestCase.Features.Length);
            for (let i = 0; i < pairwiseTestCase.Features.Length; i++) {
                testData[i] = valueSet[i][pairwiseTestCase.Features[i]];
            }
            testCases.push(testData);
        }

        return testCases;
    }

    CreateValueSet(sources: any[][]) {
        let valueSet = new Array<Array<any>>(sources.length);

        for (let i = 0; i < valueSet.length; i++) {
            let values = new Array<any>();
            for (let value of sources[i]) {
                values.push(value);
            }
            valueSet[i] = values;
        }

        return valueSet;
    }

    CreateDimensions(valueSet: Array<any>[]): number[] {
        let dimensions = new Array<number>(valueSet.length);
        for (let i = 0; i < valueSet.length; i++) {
            dimensions[i] = valueSet[i].length;
        }
        return dimensions;
    }
}

class PairwiseTestCaseGenerator {

    private _prng: FleaRand;

    private _dimensions: number[];

    private _uncoveredTuples: Array<FeatureTuple>[][];

    GetTestCases(dimensions: number[]): Array<any> {
        this._prng = new FleaRand(15485863);
        this._dimensions = dimensions;
        this.CreateAllTuples();
        const testCases = new Array<TestCaseInfo>();

        while (true) {
            let nextTuple = this.GetNextTuple();
            if (!nextTuple) {
                break;
            }
            let testCaseInfo = this.CreateTestCase(nextTuple);
            if (testCaseInfo) {
                this.RemoveTuplesCoveredByTest(testCaseInfo);
                testCases.push(testCaseInfo);
            }
        }

        return testCases;
    }

    private GetNextRandomNumber(): number {
        return this._prng.Next() >> 1;
    }

    private CreateAllTuples(): void {
        this._uncoveredTuples = new Array<Array<Array<FeatureTuple>>>();
        for (let i = 0; i < this._dimensions.length; i++) {
            this._uncoveredTuples[i] = new Array<Array<FeatureTuple>>(this._dimensions[i]);
            for (let j: number = 0; j < this._dimensions[i]; j++) {
                this._uncoveredTuples[i][j] = this.CreateTuples(i, j);
            }
        }
    }

    private CreateTuples(dimension: number, feature: number): Array<FeatureTuple> {
        let list: Array<FeatureTuple> = new Array<FeatureTuple>();
        list.push(new FeatureTuple(new FeatureInfo(dimension, feature)));

        for (let i = 0; i < this._dimensions.length; i++) {
            if (i !== dimension) {
                for (let j = 0; j < this._dimensions[i]; j++) {
                    list.push(new FeatureTuple(new FeatureInfo(dimension, feature), new FeatureInfo(i, j)));
                }
            }
        }
        return list;
    }

    private GetNextTuple(): FeatureTuple | undefined {
        for (let i = 0; i < this._uncoveredTuples.length; i++) {
            for (let j = 0; j < this._uncoveredTuples[i].length; j++) {
                let list = this._uncoveredTuples[i][j];
                if (list.length > 0) {
                    return list.shift();
                }
            }
        }
        return undefined;
    }

    private CreateTestCase(tuple: FeatureTuple): TestCaseInfo | undefined {
        let bestTestCase;
        let bestCoverage = -1;

        for (let i = 0; i < 7; i++) {
            let testCaseInfo = this.CreateRandomTestCase(tuple);
            let coverage = this.MaximizeCoverage(testCaseInfo, tuple);
            if (coverage > bestCoverage) {
                bestTestCase = testCaseInfo;
                bestCoverage = coverage;
            }
        }
        return bestTestCase;
    }

    private CreateRandomTestCase(tuple: FeatureTuple): TestCaseInfo {
        let testCaseInfo = new TestCaseInfo(this._dimensions.length);
        for (let i = 0; i < this._dimensions.length; i++) {
            testCaseInfo.Features[i] = this.GetNextRandomNumber() % this._dimensions[i];
        }
        for (let j = 0; j < tuple.Length; j++) {
            testCaseInfo.Features[tuple.get_Item(j).Dimension] = tuple.get_Item(j).Feature;
        }
        return testCaseInfo;
    }

    private MaximizeCoverage(testCase: TestCaseInfo, tuple: FeatureTuple): number {
        let totalCoverage = 1;
        let mutableDimensions = this.GetMutableDimensions(tuple);

        while (true) {
            let progress = false;
            this.ScrambleDimensions(mutableDimensions);

            for (let i = 0; i < mutableDimensions.length; i++) {
                let d = mutableDimensions[i];
                let bestCoverage = this.CountTuplesCoveredByTest(testCase, d, testCase.Features[d]);
                let newCoverage = this.MaximizeCoverageForDimension(testCase, d, bestCoverage);

                totalCoverage = totalCoverage + newCoverage;
                if (newCoverage > bestCoverage) {
                    progress = true;
                }
            }
            if (!progress) {
                return totalCoverage;
            }
        }
    }

    private GetMutableDimensions(tuple: FeatureTuple): number[] {
        let list = new Array<number>();
        let immutableDimensions = new Array<boolean>(this._dimensions.length);

        for (let i = 0; i < tuple.Length; i++) {
            immutableDimensions[tuple.get_Item(i).Dimension] = true;
        }

        for (let j = 0; j < this._dimensions.length; j++) {
            if (!immutableDimensions[j]) {
                list.push(j);
            }
        }
        return list;
    }

    private ScrambleDimensions(dimensions: number[]): void {
        for (let i = 0; i < dimensions.length; i++) {
            let j = this.GetNextRandomNumber() % dimensions.length;
            let t = dimensions[i];
            dimensions[i] = dimensions[j];
            dimensions[j] = t;
        }
    }

    private MaximizeCoverageForDimension(testCase: TestCaseInfo, dimension: number, bestCoverage: number): number {
        let bestFeatures = new Array<number>(this._dimensions[dimension]);

        for (let i = 0; i < this._dimensions[dimension]; i++) {
            testCase.Features[dimension] = i;
            let coverage = this.CountTuplesCoveredByTest(testCase, dimension, i);

            if (coverage >= bestCoverage) {
                if (coverage > bestCoverage) {
                    bestCoverage = coverage;
                    bestFeatures = [];
                }
                bestFeatures.push(i);
            }
        }
        testCase.Features[dimension] = bestFeatures[this.GetNextRandomNumber() % bestFeatures.length];

        return bestCoverage;
    }

    private CountTuplesCoveredByTest(testCase: TestCaseInfo, dimension: number, feature: number): number {
        let result = 0;
        let list = this._uncoveredTuples[dimension][feature];

        for (let i = 0; i < list.length; i++) {
            if (testCase.IsTupleCovered(list[i])) {
                result = result + 1;
            }
        }
        return result;
    }

    private RemoveTuplesCoveredByTest(testCase: TestCaseInfo): void {
        for (let i = 0; i < this._uncoveredTuples.length; i++) {
            for (let j = 0; j < this._uncoveredTuples[i].length; j++) {
                let list = this._uncoveredTuples[i][j];
                for (let k = list.length - 1; k >= 0; k = k - 1) {
                    if (testCase.IsTupleCovered(list[k])) {
                        list.splice(k);
                    }
                }
            }
        }
    }
}

class TestCaseInfo {

    Features: number[];

    constructor(length: number) {
        this.Features = new Array<number>(length);
    }

    IsTupleCovered(tuple: FeatureTuple): boolean {
        for (let i = 0; i < tuple.Length; i++) {
            if (this.Features[tuple.get_Item(i).Dimension] !== tuple.get_Item(i).Feature) {
                return false;
            }
        }
        return true;
    }
}

class FeatureTuple {

    private _features: FeatureInfo[];

    get Length(): number {
        return this._features.length;
    }

    get_Item(index: number): FeatureInfo {
        return this._features[index];
    }

    constructor(feature1: FeatureInfo);

    constructor(feature1: FeatureInfo, feature2: FeatureInfo);

    constructor(feature1: FeatureInfo, feature2?: FeatureInfo) {
        if (arguments.length === 1 || !feature2) {
            this._features = [feature1];
            return;
        }
        this._features = [feature1, feature2];
    }
}

class FeatureInfo {

    Dimension = 0;

    Feature = 0;

    constructor(dimension: number, feature: number) {
        this.Dimension = dimension;
        this.Feature = feature;
    }
}

class FleaRand {

    private _b = 0;
    private _c = 0;
    private _d = 0;
    private _z = 0;
    private _m = new Array<number>(256);
    private _r = new Array<number>(256);
    private _q = 0;

    constructor(seed: number) {
        this._b = seed;
        this._c = seed;
        this._d = seed;
        this._z = seed;

        for (let i = 0; i < this._m.length; i++) {
            this._m[i] = seed;
        }

        for (let j = 0; j < 10; j++) {
            this.Batch();
        }

        this._q = 0;
    }

    Next(): number {
        if (this._q === 0) {
            this.Batch();
            this._q = this._r.length - 1;
        } else {
            this._q--;
        }
        return this._r[this._q];
    }

    private Batch() {

        let a = 0;
        let b = this._b;
        let c = this._c + (++this._z);
        let d = this._d;

        for (let i = 0; i < this._r.length; i++) {
            a = this._m[b % this._m.length];
            this._m[b % this._m.length] = d;
            d = (c << 19) + (c >> 13) + b;
            c = b ^ this._m[i];
            b = a + d;
            this._r[i] = c;
        }

        this._b = b;
        this._c = c;
        this._d = d;
    }
}

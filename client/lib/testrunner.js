import * as _chai from './chai.js'; // imported as chai

export async function runTests(config, appWindow, cb) {
    const { name, path, description, tags, params } = config;

    if (typeof cb != 'function') {
        console.log('TestRunner: Invalid callback function provided to runTests.')
        cb = () => {};
    }

    const testRunner = new TestRunner(
        name,
        description,
        tags,
        cb
    );

    const context = {
        params,
        run: testRunner,
        test: chai,
        appWindow
    };

    const base = document.location.origin;
    const importURL = new URL(`${path}`, base).toString();
    const test = await import(importURL);
    await test.default(context);
    await testRunner.runTestSuite();
}

class TestRunner {
    
    constructor (name, description, tags, cb) {
        this.name = name;
        this.description = description;
        this.tags = tags;
        this.cb = cb;
        this.testCases = [];
  
        this.testSuiteSummary = {
            name: this.name,
            description: this.description,
            tests: 0,
            failures: 0,
            time: 0,
            testCases: []
        };
    }
  
    runTestSuite() {
        // const tags = this.tags;
        // const testCases = this.testCases;
        // const testSuiteSummary = this.testSuiteSummary;
        let testSuiteRunTime = 0;
        let testCaseFailureCount = 0;

        const runTestCase = (count) => {
            if (count < this.testCases.length) {
                const testCase = this.testCases[count];
                if (testCase.tags.length === 0 || testCase.tags.some((tag) => this.tags.includes(tag))) {
                    setTimeout(async () => { 
                        const testCaseSummary = {
                            name: testCase.name,
                            description: testCase.description,
                            time: 0,
                            failure: false,
                        };
                        try {
                            const startMark = performance.mark('t');
                            await testCase.fn();
                            const runTime = Math.round(performance.measure('', startMark.name).duration / 0.1000) / 1000;
                            testCaseSummary.time = runTime;
                            testSuiteRunTime += runTime;
                        }
                        catch (e) {
                            testCaseFailureCount++;
                            testCaseSummary.failure = {
                                type: e.name || 'error',
                                message: e.message,
                            };
                        }
                        this.testSuiteSummary.testCases.push(testCaseSummary);
                        this.cb(testCase.name);
                        runTestCase(count + 1);
                    }, testCase.delay)
                }
            }
            else {
                this.testSuiteSummary.time = testSuiteRunTime;
                this.testSuiteSummary.tests = this.testCases.length;
                this.testSuiteSummary.failures = testCaseFailureCount;
                this.cb(this.testSuiteSummary);
            }
        }

        runTestCase(0);
    }
  
    testCase(name, description, tags, delay, fn) {
        if (delay === undefined || typeof delay != 'number') delay = 0;
        this.testCases.push({ name, description, tags, delay, fn });
    }
}
  
export async function sleep(time, fn) {
    await new Promise(() => setTimeout(fn, time));
}

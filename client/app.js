import { runTests } from './lib/testrunner.js';
import { TestRunGroups, TestRuns } from './../tests/testruns.js';
import { copyToClipboard } from './lib/utils.js';

import './app.service.js';

export async function init(component) {

    await component.useViewTemplate('/testrunner/client/app.html');

    component.init((view) => {
        view.state.summary = {};
        
        view.testRunGroups.label = 'Test Run Group';
        view.testRunGroups.options = TestRunGroups;
        view.testRunGroups.onchange = () => {
            view.testRuns.value = '';
            view.testRuns.options = TestRuns[view.testRunGroups.value];
            view.runTest.disabled = true;
            view.viewSummary.disabled = true;
            view.testRunStatus.innerText = '';
        }

        view.testRuns.label = 'Test Run';
        view.testRuns.map = { text: 'name' };
        view.testRuns.onchange = () => {
            view.runTest.disabled = (view.testRuns.value) ? false : true;
            view.testRunStatus.innerText = '';
        }

        view.runTest.text = 'Run';
        view.runTest.style = 'button.primary';
        view.runTest.onclick = async () => {
            view.viewSummary.disabled = true;
            view.testRunStatus.innerText = '';
            const config = TestRuns[view.testRunGroups.value][view.testRuns.value];
            config.params.host = document.location.origin;
            await runTests(config, document.querySelector('[data-id="appWindow"]').contentWindow, (statusUpdate) => {
                if (typeof statusUpdate == 'string') {
                    testRunStatus(view, statusUpdate);
                }
                else {
                    testRunCompleted(view, statusUpdate);
                }
            })
        }
        view.runTest.disabled = true;

        view.viewSummary.text = 'View Summary';
        view.viewSummary.style = 'button.primary';
        view.viewSummary.onclick = async () => {
            await copyToClipboard(JSON.stringify(view.state.summary));
        }
        view.viewSummary.disabled = true;

        view.appWindow.src = document.location.origin;
    })
}

export function refresh () {
    
}

function testRunStatus (view, statusUpdate) {
    view.testRunStatus.innerText = statusUpdate;
    view.testRunStatus.style.color = '#000000de';
}

function testRunCompleted (view, testSuiteSummary) {
    view.state.summary = testSuiteSummary;
    if (view.state.summary.failures == 0) {
        view.testRunStatus.innerText = 'Passed';
        view.testRunStatus.style.color = 'green';
    }
    else {
        view.testRunStatus.innerText = 'Failed';
        view.testRunStatus.style.color = 'red';
    }
    view.viewSummary.disabled = false;
}

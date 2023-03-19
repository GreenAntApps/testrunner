import { postMessage, registerMessageListener, request } from '../../shared/client/lib/jsphere.js';

registerMessageListener('RetrieveTestRuns', retrieveTestRuns);

async function retrieveTestRuns(data) {
    try {
        const response = await request({ method:'POST', url:'/api/testruns', data });
        const message = await response.json();
        switch (message.subject) {
            case 'TestRunsRetrieved': 
                postMessage(message.subject, message.data);
                break;
            default: console.log(message)
        }
    }
    catch (e) {
        console.log(e);
    }    
}

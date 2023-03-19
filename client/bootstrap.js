import { navigateTo, registerRoute, app } from '../../shared/client/lib/jsphere.js';

const appState = {};

// REGISTER APPLICATION ROUTES
registerRoute('/testrunner', defaultRouteHandler);

// NAVIGATE TO DEFAULT ROUTE
navigateTo();

// ROUTE HANDLERS
async function defaultRouteHandler(params) {
    await app.use('/testrunner/client/app.js', appState);
}

'use strict';

const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const Infermedica = require('./apiHandler');

//API.AI FUNCTIONS
const WELCOME_TASK = 'input.welcome';
const FALLBACK = 'input.unknown';
const CONSENT_AGREE = 'input.consent-agreed';

//API.AI parameter names

//API.AI Contexts/lifespans
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

//Other Configs
const TARGET_ACCURACY = 0.8;    //target accuracy of 80%...  this can be adjusted later on
const NO_INPUTS = [
    'Sorry, I didn\'t catch that.',
    'Are you still there?  Please say your response.',
    'We can stop here.  Remember: If you aren\'t improving in the next 24 hours, or you feel that your condition worsens, please contact your primary care physician or seek emergency medical assistance.  \
        Get well soon!',
];

exports.sogetiHackathon = functions.https.onRequest((request, response) => {
    const app = new App({request, response});

    //Welcome task and disclaimer agreement...  If the user does not consent to our disclaimer we will boot them from the app.
    function welcome() {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse('Hello, and thanks for using Diagnose Me!  Before we can continue, you\'ll need to acknowledge the statement below.')
                .addBasicCard(
                    app.buildBasicCard('Hello, and thanks for using Diagnose Me! If this is a medical emergency, please dial 9-1-1 from your phone immediately. \
                    Please remember that this app is only to be used for informative purposes and does not replace your normal doctor or an emergency medical practitioner. \
                    If your symptoms persist or worsen over the next 24 hours, seek medical attention right away, either through your primary care provider or an emergency medical provider.')
                )
                .addSimpleResponse('Do you understand?')
                .addSuggestions(['Yes', 'No'])
            );
        }
        else { //no screen output
            app.ask('Hello, and thanks for using Diagnose Me!  Please listen carefully to this disclaimer.' +
                'If this is a medical emergency, please dial 9-1-1 from your phone immediately. ' +
                'Please remember that this app is only to be used for informative purposes and does not replace your normal doctor.' +
                'If your symptoms persist or worsen over the next 24 hours, seek medical attention right away, either through your primary care provider or an emergency medical provider.' +
                'Do you understand?  Please say "yes" or "no".', NO_INPUTS);
        }
    }

    //The action mapper....
    let actionMap = new Map();
    actionMap.set(WELCOME_TASK, welcome);
    app.handleRequest(actionMap);
});
'use strict';

const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const Infermedica = require('./apiHandler');
const responseHelper = requrire('./responseHelper');

//API.AI FUNCTIONS

//API.AI parameter names

//API.AI Contexts/lifespans
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

//Other Configs
const TARGET_ACCURACY = 0.8;    //target accuracy of 80%...  this can be adjusted later on
const NO_INPUTS = [
    'Sorry, I didn\'t catch that.',
    'If you just said something, I didn\'t hear you.  Please try saying your response again.',
    'Don\'t worry if you need more time.  I can give you a moment.  Let me know your response when you\'re ready.'
];

exports.sogetiHackathon = functions.https.onRequest((request, response) => {
    const app = new App({request, response});

    //API.AI Function handlers go here...

    //The action mapper....
    let actionMap = new Map();
    //Actions will go here once I start to formulate them...
    app.handleRequest(actionMap);
});
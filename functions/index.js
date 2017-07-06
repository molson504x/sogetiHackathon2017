'use strict';

const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
//require('./apiHandler');
const InfermedicaApi = require('./apiHandlerTest');

//API.AI FUNCTIONS
const WELCOME_TASK = 'input.welcome';
const FALLBACK = 'input.unknown';
const EASTER_EGG = 'input.easteregg';


const GET_DISCLAIMER = 'disclaimer';
const ACCEPT_DISCLAIMER = 'disclaimer.yes';
const DECLINE_DISCLAIMER = 'disclaimer.no';

const DIAGNOSIS_START = 'diagnosis.start';
const DIAGNOSIS_PATIENT_INFO = 'diagnosis.patient-info';
const DIAGNOSIS_BEGIN_VOLLEY = 'diagnosis.beginVolley';
const DIAGNOSIS_VOLLEY = 'diagnosis.volley';

//API.AI parameter names
const GENDER_PARAM = 'gender';
const AGE_PARAM = 'age';

//API.AI Contexts/lifespans
const DISCLAIMER_FOLLOWUP = 'Disclaimer-followup';
const DIAGNOSIS_START_CONTEXT = 'Diagnosis-Start-Context';
const DIAGNOSIS_PATIENT_INFO_CONTEXT = 'Diagnosis-Patient-Info';
const DIAGNOSIS = 'Diagnosis-Context';
const DEFAULT_LIFESPAN = 2;
const END_LIFESPAN = 0;

//Other Configs
const TARGET_ACCURACY = 0.8;    //target accuracy of 80%...  this can be adjusted later on
const NO_INPUTS = [
    'Sorry, I didn\'t catch that.',
    'Are you still there?  Please say your response.',
    'I guess you left.  Remember, if this is a medical emergency, please dial 9-1-1 as soon as possible or seek out emergency medical attention. \
        Feel better soon!  Goodbye.'
];
const DISCLAIMER = 'Hello, and thanks for using Diagnose Me!  This is meant for informational purposes only and should \
    not be used as a replacement to a primary care physician or a medical practitioner.  If you believe that you are having \
    a medical emergency, please select say "Exit" and call 9-1-1 or seek care from an emergency room or urgent care center \
    as soon as possible.  This app uses an established machine learning API which is being constantly vetted by medical professionals \
    but it may not always be accurate in its diagnosis and is not intended to give a definitive diagnosis.  In all instances, \
    you should be seen by a primary care physician regularly.  If your condition is urgent, you should seek counsel from a primary \
    care provider or emergency medical practitioner as soon as possible.  Once again, we thank you for using the Diagnose Me \
    action on the google assistant, and we hope you feel better soon.';

exports.sogetiHackathon = functions.https.onRequest((request, response) => {
    const app = new App({request, response});

    app.data.diagnosisModel = {
        'sex': null,
        'age': null,
        'evidence': []        
    };

    //All good apps have an easter egg, right?
    function easterEgg() {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse('This agent was made as part of a Sogeti Hackathon.')
                .addBasicCard(
                    app.buildBasicCard('This application was made possible by the Sogeti Florida team as part of the internal 2017 hackathon. \
                        At Sogeti, Our local touch is your global reach.')
                    .setImage('https://pbs.twimg.com/profile_images/740604141941063680/eMMoLIH6.jpg', 'The Sogeti logo')
                    .addButton('Visit Sogeti Online', 'https://www.us.sogeti.com/')
                )
                .addSimpleResponse('At Sogeti, our local touch is your global reach.')
            );
        }
        else {
            app.ask('This application was made possible by the Sogeti Florida team as part of our internal 2017 hackathon. \
                At Sogeti, our local touch is your global reach.  For more information about us, please visit our website at \
                http://www.us.sogeti.com.');
        }
    }

    //Welcome task and disclaimer agreement...  If the user does not consent to our disclaimer we will boot them from the app.
    function welcome() {
        app.setContext(DISCLAIMER_FOLLOWUP, DEFAULT_LIFESPAN);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse('Hello, and thanks for using the Diagnose Me app.  If you feel that this is an emergency, please \
                    dial 9-1-1 immediately.  Before we begin, I\'ll need you to agree to my disclaimer.')
                .addBasicCard(app.buildBasicCard(DISCLAIMER))
                .addSimpleResponse('Do you agree?')
                .addSuggestions(['Yes', 'No'])
            );
        }
        else { //no screen output
            app.ask('Hello, and thanks for using the Diagnose Me app. If you feel that this is an emergency, please \
                dial 9-1-1 immediately.  Before we begin, I\'ll need you to agree to my disclaimer.  If you wish to hear this disclaimer, \
                please say something like "show me the disclaimer."  Otherwise, you can say something like "yes" or "no."', NO_INPUTS);
        }
    }

    function getDisclaimer() {
        app.setContext(DISCLAIMER_FOLLOWUP, DEFAULT_LIFESPAN);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse('Here you go.  Please read this carefully.')
                .addBasicCard(
                    app.buildBasicCard(DISCLAIMER)
                )
                .addSimpleResponse('Do you understand and agree to this disclaimer?')
                .addSuggestions(['Yes', 'No'])
            );
        }
        else {
            app.ask('Here\'s our disclaimer: ' + DISCLAIMER);
            app.ask('Do you understand and agree to this disclaimer?', NO_INPUTS);
        }
    }

    function disclaimerAgree() {
        app.setContext(DIAGNOSIS_START_CONTEXT, DEFAULT_LIFESPAN);
        app.data.agreeToDisclaimer = true;

        //same response for google home and phone...
        app.ask('Great! Let\'s get started.  What seems to be the problem?');
    }

    function disclaimerDisagree() {
        app.setContext(DISCLAIMER_FOLLOWUP, DEFAULT_LIFESPAN);
        app.data.disclaimerAgree = false;

        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse('In order to use this tool, I need you to agree to the disclaimer.  If you cannot agree to the disclaimer, please end \
                this conversation by saying "Goodbye".')
                .addSuggestions(['I Agree', 'What is the disclaimer?', 'Goodbye'])
            );
        }
        else {
            app.ask('In order to use this tool, I need you to agree to the disclaimer.  If you cannot agree to the disclaimer, please end this \
            conversation by saying "Goodbye".  If you wish to listen to the disclaimer, say something like "What is the disclaimer?". \
            Will you agree with the disclaimer?', NO_INPUTS);
        }
    }

    function getInitialSymptoms(app) {
        if (app.data.disclaimerAgree == false) {
            app.setContext(DISCLAIMER_FOLLOWUP, DEFAULT_LIFESPAN);
            disclaimerDisagree();
            return;
        }

        let initialSymptomsToParse = app.getArgument('OriginalSymptoms');
        let initialSymptoms = InfermedicaApi.parseText(initialSymptomsToParse);
        if (initialSymptoms == null || !initialSymptoms.length) {
            app.setContext(DIAGNOSIS_START_CONTEXT, DEFAULT_LIFESPAN);
            app.ask('Oops!  I may have misunderstood what you said.  Can you please tell me your symptoms again?');
            return;
        }

        app.data.diagnosisModel.evidence = initialSymptoms;
        app.setContext(DIAGNOSIS_PATIENT_INFO_CONTEXT);
        app.ask('Got it.  Now, I just need a little more information to get you the best diagnosis.  Can I have your age and gender please?', NO_INPUTS);
    }

    function getPatientInfo(app) {
        if (app.data.disclaimerAgree == false) {
            app.setContext(DISCLAIMER_FOLLOWUP, DEFAULT_LIFESPAN);
            disclaimerDisagree();
            return;
        }

        let age = app.getArgument(AGE_PARAM);
        let gender = app.getArgument(GENDER_PARAM);

        app.data.tempAge = age.amount;
        app.data.tempGender = gender;

        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(`Ok great.  Just to make sure I understood this all correctly, you are a ${app.data.tempAge} year old ${app.data.tempGender}.  Is this correct?`)
                .addSuggestions(['Yes', 'No'])
            );
        }
        else {
            app.ask(`Before we continue, I want to make sure I understood you correctly.  You said you are a ${app.data.tempAge} year old ${app.data.tempGender}, right?`);
        }
    }

    function beginDiagnosisVolley(app) {
        //User has confirmed the required info, store it officially and let's get started.
        app.data.diagnosisModel.age = app.data.tempAge;
        app.data.diagnosisModel.sex = app.data.tempGender;

        app.ask('Alright.  I\'m going to try to give you the best diagnosis as I can, but I may need to ask you a few follow-up questions to help with that.  \
            Once I am confident in my diagnosis, I\'ll let you know what I think your condition is, and how severe it is.  Let\'s get started.');
        
        doVolley(app);
    }

    function doVolley(app) {
        //TODO: Call the Infermedica API

        //TODO: On the Infermedica response, if any diagnoses are 85+% accurate, return the diagnosis...

        //TODO: ELSE, Ask the follow-up question
    }

    //The action mapper....
    let actionMap = new Map();
    actionMap.set(WELCOME_TASK, welcome);
    actionMap.set(EASTER_EGG, easterEgg);
    actionMap.set(GET_DISCLAIMER, getDisclaimer);
    actionMap.set(ACCEPT_DISCLAIMER, disclaimerAgree);
    actionMap.set(DECLINE_DISCLAIMER, disclaimerDisagree);
    actionMap.set(DIAGNOSIS_START, getInitialSymptoms);
    actionMap.set(DIAGNOSIS_PATIENT_INFO, getPatientInfo);
    actionMap.set(DIAGNOSIS_BEGIN_VOLLEY, beginDiagnosisVolley);
    app.handleRequest(actionMap);
});
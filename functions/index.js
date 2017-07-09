'use strict';

const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
//require('./apiHandler');
const InfermedicaApi = require('./apiHandlerTest');
const _ = require('lodash');

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
const DIAGNOSIS_SINGLE = 'diagnosis.single';
const DIAGNOSIS_GROUP_SINGLE = 'diagnosis.group-single';
const DIAGNOSIS_GROUP_MULTIPLE = 'diagnosis.group-multiple';
const DIAGNOSIS_ANSWER = 'diagnosis.answer';

//API.AI parameter names
const GENDER_PARAM = 'gender';
const AGE_PARAM = 'age';

//API.AI Contexts/lifespans
const DISCLAIMER_FOLLOWUP = 'Disclaimer-followup';
const DIAGNOSIS_START_CONTEXT = 'Diagnosis-Start-Context';
const DIAGNOSIS_PATIENT_INFO_CONTEXT = 'Diagnosis-Patient-Info';
const DIAGNOSIS = 'Diagnosis-Context';
const DIAGNOSIS_SINGLE_CONTEXT = 'Diagnosis-Single-Context';
const DIAGNOSIS_GROUP_SINGLE_CONTEXT= 'Diagnosis-Group-Single-Context';
const DIAGNOSIS_GROUP_MULTIPLE_CONTEXT = 'Diagnosis-Group-Multiple-Context';
const DIAGNOSIS_ANSWER_CONTEXT = 'Diagnosis-Answer-Context';

const DEFAULT_LIFESPAN = 2;
const END_LIFESPAN = 0;

//Other Configs
const TARGET_ACCURACY = 0.9;    //target accuracy of 90%...  this can be adjusted later on
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

const FOLLOW_UP_QUESTIONS_PRETEXT = [
    'I have an idea of what might be wrong, but I\'m not quite sure.  Help me out by answering this question.',
    'Hmm, I\'m not quite sure, but I have an idea.  Please help me out by answering this question.',
    'To help me give you the best diagnosis possible, please help me by answering this question.',
    'Please help me out by answering this question.',
    'I\'m getting closer to having a diagnosis, but I\'d like to be more certain.  Please answer this question to help me out.'
];

const GROUP_OPTION_PRETEXT = [
    'How about ',
    'What about ',
    'Let\'s try ',
    'Alright.  What about ',
];

function getRandomFollowupPretext() {
    let randomIndex = Math.floor((Math.random() * 5))

    return FOLLOW_UP_QUESTIONS_PRETEXT[randomIndex];
}

function getRandomOptionPretext() {
    let randomIndex = Math.floor((Math.random() * 4));

    return GROUP_OPTION_PRETEXT[randomIndex];
}

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
        app.setContext(DIAGNOSIS, DEFAULT_LIFESPAN);
        app.setContext(DIAGNOSIS_START_CONTEXT, END_LIFESPAN);
        
        _doVolley(app);
    }

    function diagnosisSingleChoiceResponse(app) {
        let symptom = app.data.singleQuestionSymptom;
        let choice_id = app.getArgument('answer');

        console.log(`Choice: ${choice_id}`);

        let conditionToAdd = {id: symptom.id, choice_id: choice_id};
        app.data.diagnosisModel.evidence.push(conditionToAdd);

        _doVolley(app);
        return;
    }

    function diagnosisGroupSingleResponse(app) {
        let response = app.getArgument('answer');
        console.log(`Option Chosen: ${response}`);

        if (response === 'present') {
            let conditionToAdd = {id: app.data.groupQuestions.items[app.data.groupOptionIndex].id, choice_id: 'present'};
            app.data.diagnosisModel.evidence.push(conditionToAdd);
            app.setContext(DIAGNOSIS_GROUP_SINGLE_CONTEXT, END_LIFESPAN);
            _doVolley(app);
            return;
        }
        else {
            app.data.groupOptionIndex = app.data.groupOptionIndex + 1;
        }

        if (app.data.groupOptionIndex >= app.data.groupQuestions.items.length) {
            //Add all options as "unknown" to the symptoms list
            _.each(app.data.groupQuestions.items, (option) => {
                let conditionToAdd = {id: option.id, choice_id: 'unknown'};
                app.data.diagnosisModel.evidence.push(conditionToAdd);
            });
            app.setContext(DIAGNOSIS_GROUP_SINGLE_CONTEXT, END_LIFESPAN);

            _doVolley(app);
            return;
        }

        //Give the user the next choice...
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`)
                .addSuggestions(['Yes', 'No', 'I Don\'t Know'])
            );
        }
        else {
            app.ask(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`);
        }
    }

    function diagnosisGroupMultipleResponse(app) {
        let response = app.getArgument('answer');
        console.log(`Option Chosen: ${response}`);

        let conditionToAdd = {id: app.data.groupQuestions.items[app.data.groupOptionIndex].id, choice_id: response};
        app.data.diagnosisModel.evidence.push(conditionToAdd);
        app.data.groupOptionIndex = app.data.groupOptionIndex + 1;

        if (app.data.groupOptionIndex >= app.data.groupQuestions.items.length) {
            app.setContext(DIAGNOSIS_GROUP_MULTIPLE_CONTEXT, END_LIFESPAN);

            _doVolley(app);
            return;
        }

        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`)
                .addSuggestions(['Yes', 'No', 'I don\'t know'])
            );
        }
        else {
            app.ask(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`);
        }
    }

    function _doVolley(app) {
        //Call the Infermedica API
        let diagnosis = InfermedicaApi.diagnosis(app.data.diagnosisModel);
        console.log('Diagnosis Response: ' + JSON.stringify(diagnosis));
        //Assumes that the conditions array will come back sorted by accuracy...
        let maxAccuracyCondition = _.find(diagnosis.conditions, (o) => {
            return o.probability >= TARGET_ACCURACY;
        });

        if (undefined !== maxAccuracyCondition) {   //We have a winner!
            console.log('Accuracy > 90 achieved.');
            app.setContext(DIAGNOSIS_ANSWER_CONTEXT, DEFAULT_LIFESPAN);
            app.tell('This will be implemented later.');
            return;
        }

        switch (diagnosis.question.type) {
            case 'single': 
                console.log('Single type question...');
                _askSingleChoiceQuestion(diagnosis.question, app);
                break;
            case 'group_single':
                console.log('Group Single type question...');
                _askGroupSingleQuestion(diagnosis.question, app);
                break;
            case 'group_multiple':
                console.log('Group Multiple type question...');
                _askGroupMultipleQuestion(diagnosis.question, app);
                break;
        }
    }

    function _askSingleChoiceQuestion(question, app) {
        app.data.singleQuestionSymptom = question.items[0];
        app.setContext(DIAGNOSIS_SINGLE_CONTEXT);

        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(getRandomFollowupPretext())
                .addSimpleResponse(question.text)
                .addSuggestions(['Yes', 'No', 'I Don\'t Know'])
            );
        }
        else {
            app.ask(question.text, NO_INPUTS);
        }
    }

    function _askGroupSingleQuestion(question, app) {
        app.data.groupQuestions = question;
        app.data.groupOptionIndex = 0;

        app.setContext(DIAGNOSIS_GROUP_SINGLE_CONTEXT);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(`This question has more than one option.  I'm going to give you the options one at a time.  The question is ${question.text}`)
                .addSimpleResponse(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`)
                .addSuggestions(['Yes', 'No', 'I Don\'t Know'])
            );
        }
        else {
            app.ask(`This question has more than one option.  I'll give you the options one at a time."  
            The question is ${question.text}.  ${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`, NO_INPUTS);
        }
    }

    function _askGroupMultipleQuestion(question, app) {
        app.data.groupQuestions = question;
        app.data.groupOptionIndex = 0;
        app.setContext(DIAGNOSIS_GROUP_MULTIPLE_CONTEXT);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(`This question has more than one answer, and more than one may apply to you.  Just answer each option by saying "yes", "no", or "I don't know".
                    The question is ${app.data.groupQuestions.text}`)
                .addSimpleResponse(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`)
                .addSuggestions(['Yes', 'No', 'I don\'t know'])
            );
        }
        else {
            app.ask(`This question has more than one answer.  I am going to ask you the question, and then present you with the answer choices.  You can respond to each option by 
                saying "yes", "no", or "I don't know".  The question is ${app.data.groupQuestions.text}`);
            app.ask(`${getRandomOptionPretext()} ${app.data.groupQuestions.items[app.data.groupOptionIndex].name}`, NO_INPUTS);
        }

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
    actionMap.set(DIAGNOSIS_SINGLE, diagnosisSingleChoiceResponse);
    actionMap.set(DIAGNOSIS_GROUP_SINGLE, diagnosisGroupSingleResponse);
    actionMap.set(DIAGNOSIS_GROUP_MULTIPLE, diagnosisGroupMultipleResponse);
    app.handleRequest(actionMap);
});
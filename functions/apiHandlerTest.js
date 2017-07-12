//Any requires you have should go here.
//These are all hard-coded responses....
let _volleyNumber = 0;

//After the 5 volleys shown here, we have an accuracy > 90% case, so we don't really need any more
const volleyCase1 = {"question":{"type":"single","text":"Has your headache started suddenly?","items":[{"id":"s_1542","name":"Headache, sudden","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]}],"extras":{}},"conditions":[{"id":"c_49","name":"Migraine","common_name":"Migraine","probability":0.7527},{"id":"c_671","name":"Encephalitis","common_name":"Encephalitis","probability":0.394},{"id":"c_562","name":"Viral meningitis","common_name":"Viral meningitis","probability":0.2084},{"id":"c_685","name":"Subarachnoid hemorrhage","common_name":"Subarachnoid hemorrhage","probability":0.1674},{"id":"c_563","name":"Bacterial meningitis","common_name":"Bacterial meningitis","probability":0.1446}],"extras":{}};
const volleyCase2 = {"question":{"type":"single","text":"Do you have an elevated body temperature or fever?","items":[{"id":"s_98","name":"Fever","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]}],"extras":{}},"conditions":[{"id":"c_49","name":"Migraine","common_name":"Migraine","probability":0.8123},{"id":"c_671","name":"Encephalitis","common_name":"Encephalitis","probability":0.4415},{"id":"c_685","name":"Subarachnoid hemorrhage","common_name":"Subarachnoid hemorrhage","probability":0.3264},{"id":"c_562","name":"Viral meningitis","common_name":"Viral meningitis","probability":0.2344},{"id":"c_55","name":"Tension-type headaches","common_name":"Tension-type headaches","probability":0.1713},{"id":"c_563","name":"Bacterial meningitis","common_name":"Bacterial meningitis","probability":0.1627}],"extras":{}};
const volleyCase3 = {"question":{"type":"group_multiple","text":"How would you describe your headache?","items":[{"id":"s_25","name":"Pulsing or throbbing","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]},{"id":"s_604","name":"Feels like \"stabbing\" or \"drilling\"","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]},{"id":"s_23","name":"Feels like pressure around my head","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]}],"extras":{}},"conditions":[{"id":"c_49","name":"Migraine","common_name":"Migraine","probability":0.8123},{"id":"c_685","name":"Subarachnoid hemorrhage","common_name":"Subarachnoid hemorrhage","probability":0.3055},{"id":"c_671","name":"Encephalitis","common_name":"Encephalitis","probability":0.2185},{"id":"c_55","name":"Tension-type headaches","common_name":"Tension-type headaches","probability":0.1772}],"extras":{}};
//const volleyCase3 = {"question":{"type":"group_single","text":"What is your body temperature?","items":[{"id":"s_99","name":"Between 99.5 and 101 °F (37 and 38 °C)","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]},{"id":"s_100","name":"Above 101 °F (38 °C)","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]}],"extras":{}},"conditions":[{"id":"c_49","name":"Migraine","common_name":"Migraine","probability":0.8123},{"id":"c_671","name":"Encephalitis","common_name":"Encephalitis","probability":0.5791},{"id":"c_685","name":"Subarachnoid hemorrhage","common_name":"Subarachnoid hemorrhage","probability":0.3491},{"id":"c_562","name":"Viral meningitis","common_name":"Viral meningitis","probability":0.3264},{"id":"c_563","name":"Bacterial meningitis","common_name":"Bacterial meningitis","probability":0.2266},{"id":"c_55","name":"Tension-type headaches","common_name":"Tension-type headaches","probability":0.1649}],"extras":{}};
const volleyCase4 = {"question":{"type":"group_multiple","text":"Is there anything that makes your headache worse?","items":[{"id":"s_799","name":"Gets worse in the morning","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]},{"id":"s_1762","name":"Gets worse when I'm stressed","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]},{"id":"s_625","name":"Gets worse when I bend my head down","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]}],"extras":{}},"conditions":[{"id":"c_49","name":"Migraine","common_name":"Migraine","probability":0.8898},{"id":"c_671","name":"Encephalitis","common_name":"Encephalitis","probability":0.4014},{"id":"c_55","name":"Tension-type headaches","common_name":"Tension-type headaches","probability":0.3727},{"id":"c_685","name":"Subarachnoid hemorrhage","common_name":"Subarachnoid hemorrhage","probability":0.239}],"extras":{}};
const volleyCase5 = {"question":{"type":"single","text":"Do you have a runny nose?","items":[{"id":"s_107","name":"Nasal catarrh","choices":[{"id":"present","label":"Yes"},{"id":"absent","label":"No"},{"id":"unknown","label":"Don't know"}]}],"extras":{}},"conditions":[{"id":"c_49","name":"Migraine","common_name":"Migraine","probability":0.9737},{"id":"c_55","name":"Tension-type headaches","common_name":"Tension-type headaches","probability":0.7323},{"id":"c_671","name":"Encephalitis","common_name":"Encephalitis","probability":0.4014},{"id":"c_133","name":"Acute rhinosinusitis","common_name":"Acute rhinosinusitis","probability":0.2006}],"extras":{}};

class InfermedicaApi {
    static parseText (text) {
        return [
            {
                id: 's_1193',
                choice_id: 'present'
            },
            {
                id: 's_488',
                choice_id: 'present'
            },
            {
                id: 's_418',
                choice_id: 'present'
            }
        ];
    }

    static diagnosis (diagnosisData) {
        console.log('Diagnosis Data: ' + JSON.stringify(diagnosisData));
        _volleyNumber = _volleyNumber + 1;
        console.log('Volley number: ' + _volleyNumber);
        switch (_volleyNumber) {
            case 1: return volleyCase1;
            case 2: return volleyCase2;
            case 3: return volleyCase3;
            case 4: return volleyCase4;
            case 5: return volleyCase5;
        }
    }

    static getConditionInfo(conditionId) {
        return {"id":"c_49","name":"Migraine","common_name":"Migraine","sex_filter":"both","categories":["Neurology"],"prevalence":"moderate","acuteness":"chronic_with_exacerbations","severity":"mild","extras":{"hint":"I'd recommend seeing a neurologist.","icd10_code":"G43"},"triage_level":"self_care"};
    }
};
module.exports = InfermedicaApi;
//Any requires you have should go here.
const http = require('http');

const STANDARD_HEADERS = {
    'App-Id': APP_ID,
    'App-Key': APP_KEY,
    'Accept': 'application/json'
}
const API_HOST = 'api.infermedica.com';
class InfermedicaApi {
    static parseText(text) {
        let responseData = '';
        let options = {
            protocol: 'https',
            host: API_HOST,
            path: '/v2/parse',
            headers: STANDARD_HEADERS,
            method: 'POST'
        };

        let requestBody = {
            text: text
        };        let requestBody = {
            text: text
        };

        let request = http.request(options, (response) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                return JSON.parse(responseData);
            });
        });

        request.write(requestBody);
        request.end();
    }
    //post request which reaches infermedica to gather diagnosis
   static diagnosisText(diagnose){
        let diagnosisInfo = ' ';
        let options = {
                    hostname:'api.infermedica.com',
                    protocol: 'https',
                    path: '/v2/diagnosis',
                    method: 'POST',
                    headers: STANDARD_HEADERS,
                      };
       
        let requestBody = {  diagnose: diagnose};
        let request = http.request(options, (diagnose) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => { 
                responseData += chunk ;

        let request = http.request(options, (response) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                return JSON.parse(responseData);
            });
        });

        request.write(requestBody);
        request.end();
    }
   
// write data to request body
            req.write(postData);
            req.end();}
};
                                   
 // fetches the infermedica conditions    
    static conditionFacts(conditions){ 
        let conditionFacts = ' '; 
        let options = {  
            method: 'GET',
            path: '/api/v2/conditions/{id}',
            protocol: 'HTTPS',
            Host: API_HOST,
            headers: STANDARD_HEADERS,
    };
            
module.exports = InfermedicaApi;

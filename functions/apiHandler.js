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
};
module.exports = InfermedicaApi;

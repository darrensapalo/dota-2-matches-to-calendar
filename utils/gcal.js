"use strict";
exports.__esModule = true;
var fs = require("fs");
var readline = require("readline");
var googleapis_1 = require("googleapis");
var rxjs_1 = require("rxjs");
var SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];
var TOKEN_PATH = 'token.json';
function getAuthorizedClient() {
    return new rxjs_1.Observable(function (subscriber) {
        fs.readFile('credentials.json', function (err, content) {
            if (err) {
                subscriber.error(err);
                return;
            }
            authorize(JSON.parse(content.toString('utf8')), function (oauth) {
                subscriber.next(oauth);
                subscriber.complete();
            });
        });
    });
}
exports.getAuthorizedClient = getAuthorizedClient;
function authorize(credentials, callback) {
    var _a = credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
    var oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err)
            return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token.toString('utf8')));
        callback(oAuth2Client);
    });
}
function getAccessToken(oAuth2Client, callback) {
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oAuth2Client.getToken(code, function (err, token) {
            if (err)
                return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
                if (err)
                    return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
//# sourceMappingURL=gcal.js.map
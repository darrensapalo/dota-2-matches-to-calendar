import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import * as readline from "readline";
import { Observable } from "rxjs";
import { catchError, map, mapTo, mergeMap } from "rxjs/operators";
import { tokenToString } from "typescript";
import { GAccountSelector } from "../interfaces/gcal";
import { loadFile, parseAsJSON, saveFile } from "./file";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

export type AccessToken = any;

export class GoogleCalendarAuth implements GAccountSelector {

  constructor(private dotaAccountID: string, private calendarID: string) {

  }

  getCalendarID(): string {
    return this.calendarID;
  }

  getDotAAccountID(): string {
    return this.dotaAccountID;
  }

getTokenPath(): string {
  return `./tokens/${this.dotaAccountID}/token.json`;
}

getToken(): Observable<any> {
    return loadFile(this.getTokenPath()).pipe(parseAsJSON);
  }
  
  public getAuthorizedClient(): Observable<OAuth2Client> {
    const credentials$ = loadFile("credentials.json").pipe(parseAsJSON);
    return credentials$.pipe(
      mergeMap((credentials) => this.getOAuthClient(credentials))
    );
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} clientCredentials The client credentials for the Google App.
   * @param {String} dotaAccountID The account ID of the DotA account.
   */
   private getOAuthClient(clientCredentials: any): Observable<OAuth2Client> {
    const { client_secret, client_id, redirect_uris } = clientCredentials.web;

    console.log(clientCredentials.web);

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    return this.getToken().pipe(
      catchError(() => this.getAccessToken(oAuth2Client)),
      map((accessToken) => {
        oAuth2Client.setCredentials(accessToken);
        return oAuth2Client;
      })
    );
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  private getAccessToken(oAuth2Client: OAuth2Client): Observable<AccessToken> {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      redirect_uri: process.env.REDIRECT_URL,
    });

    console.log("Authorize this app by visiting this url:", authUrl);

    return new Observable((subscriber) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Enter the code from that page here: ", (code) => {
        rl.close();

        oAuth2Client.getToken(code, (err: any, token: any) => {
          if (err) {
            console.error("failed to retrieve user's access token");
            subscriber.error(err);
            return;
          }

          oAuth2Client.setCredentials(token);
          subscriber.next(token);
          subscriber.complete();
        });
      });
    }).pipe(
      // After retrieving a new token, save it to the local path and return.
      mergeMap((token) =>
        saveFile(this.getTokenPath(), JSON.stringify(token, null, 2)).pipe(mapTo(token))
      )
    );
  }
}

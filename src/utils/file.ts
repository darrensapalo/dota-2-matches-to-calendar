import * as fs from "fs";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export const parseAsJSON = map((buffer: Buffer) => JSON.parse(buffer.toString("utf-8")));

export function loadFile(filePath: string): Observable<Buffer> {
  return new Observable((subscriber) => {
    fs.readFile(filePath, (err, contents) => {
      if (err) {
        if (err.message.includes("no such file or directory")) {
          subscriber.error("file not found");
          return;
        }
        subscriber.error(err);
        return;
      }

      subscriber.next(contents);
      subscriber.complete();
    });
  });
}

export function saveFile(filePath: string, payload: any): Observable<string> {
  return new Observable((subscriber) => {
    fs.writeFile(filePath, payload, (err) => {
      if (err) {
        if (err.message.includes("no such file or directory")) {
          subscriber.error("file not found");
          return;
        }
        subscriber.error(err);
        return;
      }

      subscriber.next(filePath);
      subscriber.complete();
    });
  });
}
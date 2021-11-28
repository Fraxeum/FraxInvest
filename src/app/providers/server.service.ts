
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServerService {
  // <-------------- MAAK SEKER LINKS WERK --------------------<<<<<<<



  baseUrl = "https://app.azuzawealth.com/?";
  azuzaServerVer = "1.3";
  network = 1; // version 1.0.58 1 => TESTNET, 0 => MAINNET
  httpClient = null;

  constructor(
    httpService: HttpClient
  ) {
    this.httpClient = httpService;
    this.baseUrl += "ver=" + this.azuzaServerVer + "&iCd=";
  }

  public getGatewayPath() {
    return this.baseUrl;
  }


  public async doGetRequest(resource: string, token: string = null, params?: any): Promise<any> {

    if (!params) {
      params = {};
    }

    return new Promise((resolve, reject) => {

      this.processPostRequest(resource, token, params).subscribe(
        data => {
          if (this.sessionActive(data)) {
            console.log("HTTP: Session Active");
            resolve(data);
          } else {
            console.log("HTTP: ALERT Session Expired");
            resolve(null);
          }
        },
        err => {
          reject(false);
        }
      );

    });
  }


  // check if user is still logged in
  sessionActive(data): boolean {
    if (data && data.code === "1000") {
      return false;
    }
    return true;
  }


  // post request takes params in JSON array list,
  public async doPostRequest(resource: string, token: string = null, params?: {}): Promise<any> {

    if (!params) {
      params = {};
    }

    return new Promise((resolve, reject) => {

      this.processPostRequest(resource, token, params).subscribe(
        data => {
          if (data && this.sessionActive(data)) {

            resolve(data);
          } else {
            console.log("HTTP: ALERT Session Expired");
            resolve(null);
          }

        },
        err => {

          reject(err);

        }
      )
    });

  }

  /*
* @Returns BODY ONLY, JSON data
*/
  processPostRequest(resource: string, token: string, params): Observable<any> {
    console.log(token);

    const _fakeToken = Math.random() * 12349876;

    const _token = (token == null || !token) ? _fakeToken : token;

    params.token = _token;

    let payload = this.createPostPayload(params);

    if (!payload) { payload = ""; }

    const options = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded'),
      observe: 'body',
      responseType: 'json'
    };

    return this.httpClient.post(this.makeUrl(resource, token), payload, options);

  }


  makeUrl(resource: string, token: string) {

    return this.baseUrl + resource + "&iCn=" + this.network;
  }



  createPostPayload(data: any): string {
    if (!data) { return null; }

    let payload = "";

    for (const key in data) {
      payload += key + "=" + data[key];
      payload += "&";
    }
    console.log("Payload: " + payload.substring(0, payload.length - 1));

    return payload.substring(0, payload.length - 1);
  }

}

import { Injectable } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Camera, CameraOptions, Direction, PictureSourceType, MediaType } from '@ionic-native/camera/ngx';
import { AzuzaHelpPage } from '../azuza-help/azuza-help.page';
import { ServerService } from './server.service';
import { Storage } from '@capacitor/storage';
import { Router, NavigationExtras } from '@angular/router';
import { VideoModalPage } from '../video-modal/video-modal.page';

export class Login {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  public websiteUrl = 'https://azuzawealth.com';

  public server: ServerService;
  public popupPage: ModalController;
  public commsStatusMsg: string;
  public loadingControl: LoadingController;
  public userdata: any;

  public spinnerPopup: any;

  constructor(
    public toastCtrl: ToastController,
    public serverService: ServerService,
    //public storage: Storage    ,    
    public modalPage: ModalController,
    public loadingCtrl: LoadingController,
    public router: Router,
    public camera: Camera
  ) {
    this.server = serverService;
    this.popupPage = modalPage;
    this.loadingControl = loadingCtrl;
  }

  async getVideoPage(url, poster) {
    const modal = await this.modalPage.create({
      component: VideoModalPage,
      cssClass: 'videoModalCss',
      componentProps: {
        url,
        poster
      }
    });
    return modal;
  }

  getGatewayAddress() {
    return this.server.getGatewayPath();
  }

  async getInstructionsPage(html: string) {
    const modal = await this.modalPage.create({
      component: AzuzaHelpPage,
      cssClass: 'my-custom-class',
      componentProps: {
        htmlData: html,
      }
    });
    return modal;
  }

  async getUserInfo(token: string) {
    // Get Investment Data

    const params: {} = {};

    return await new Promise((resolve, reject) => {

      this.server.doPostRequest('userinfo', token, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);
          return;
        }

        resolve(false);
        return;

      }, (err) => {
        resolve(false);
      });

    });

  }


  // Get Investment Data
  async requestProductVitals(legalId: number): Promise<any> {

    const params: {} = { vitals: 1, legalid: legalId };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {
      if (!token) {
        resolve(false);
      }


      this.server.doPostRequest('legallist', token, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else if (response && response.data && response.data.state === 0) {
          // authentication error
          resolve(response.data.state);

        } else {

          reject(false);

        }

      }, (err) => {

        reject(false);
      });

    });

  }

  // fetch fetch banking source
  async loadBankingOptions(amount: number, currency: string = 'ZAR', denomination: string = 'ZAR', type: string = 'EFT'): Promise<any> {

    const params: { 'amount': number, 'currency': string, 'type': string, 'denomination': string } = { amount, currency, type, denomination };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }


      this.server.doPostRequest('userdeposit', token, params).then((response) => {

        if (response) {
          // successful return data
          resolve(response);

          return;

        }

        resolve(null);

      }, (err) => {

        reject(false);
      });

    });

  }

  // fetch supported currency and exchange rate list
  public async getSupportedCurrenciesAndRates(): Promise<any> {

    const params: {} = {};

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });
    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }


      this.server.doPostRequest('rates', token, params).then((response) => {

        if (response) {
          // successful return data
          resolve(response);

          return;

        }

        resolve(null);

      }, (err) => {

        reject(false);
      });

    });

  }


  // fetch support topic list
  async getSupportTopics(): Promise<any> {

    const params: { 'field': string } = { field: 'supporttopic' };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        reject(null);
      }

      this.server.doPostRequest('listvalues', token, params).then((response) => {

        if (response) {
          // successful return data
          resolve(response);

          return;

        }

        resolve(null);

      }, (err) => {

        reject(false);
      });

    });

  }


  // Returns My OTC Response data - Seller getting info from potential buyers
  async getAccountBalances(): Promise<any> {

    const params: { 'type': string } = { type: 'balance' };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });
    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }


      this.server.doPostRequest('finance', token, params).then((response) => {

        if (response) {
          // successful return data
          resolve(response);

          return;

        }

        resolve(null);

      }, (err) => {

        reject(false);
      });

    });

  }


  public async getKYCList(type: string): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    const params = {};

    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest(type, token, params).then((response) => {

        console.log(response);

        // not logged in - reauth
        if (response === null || !response) {

          resolve(null);
          return;
        }


        if (response.success) {
          resolve(response);
          return;

        }

        if (!response.success && response.message) {
          resolve(response);
          return;

        }

        reject(false);
        return;



      }, (err) => {

        reject(false);
        return;
      });

    });

  }


  // Get Investment Data
  async getTransactionList(type: string, limit: number, page: number, walletid: string, isEscrow: boolean, _event?: string): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    let event = '';

    const escrow = isEscrow ? '1' : '0';


    if (_event) {
      event = _event;
    }

    const params: { 'page': number, 'limit': number, 'scope': string, 'groupby': string, 'walletid': string, 'escrow': string, 'event'?: string, } = { page, limit, scope: '', groupby: 'Event', walletid, escrow, event };

    type = type + '&type=transaction';

    console.log('3GET MARKET DATA - TOKEN3: ' + JSON.stringify(token));

    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest(type, token, params).then((response) => {

        console.log(response);

        // not logged in - reauth
        if (response === null || !response) {

          resolve(null);
          return;
        }


        if (response.success) {
          // successful authentication
          console.log('DEBUG2');
          console.log(response);
          resolve(response);
          return;

        }

        if (!response.success && response.message) {
          resolve(response);
          return;

        }

        reject(false);
        return;



      }, (err) => {

        reject(false);
        return;
      });

    });

  }

  public async dismissLoadingPopup() {

    if (this.spinnerPopup) {
      try {
        await this.spinnerPopup.dismiss().then(() => {
          return;
        }, () => {
          console.log('Caught view not found error');
        });

      } catch (err) {
        console.log('Caught view not found error');
      }

    }
  }


  // Get Account List Data - for transaction list
  async doTransfer(type: string, walletfromaddress: string, wallettoaddress: string, currency: string, amount: string): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    const params: { 'walletfromaddress': string, 'wallettoaddress': string, 'currency': string, 'Amount': string } = { walletfromaddress: walletfromaddress, wallettoaddress: wallettoaddress, currency: currency, Amount: amount };

    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest(type, token, params).then((response) => {

        console.log(response);

        // not logged in - reauth
        if (response === null || !response) {

          resolve(null);
          return;
        }


        if (response.success) {
          // successful authentication
          console.log('TRANSFER RESPONSE');
          console.log(response);
          resolve(response);
          return;

        }

        if (!response.success && response.message) {
          resolve(response);
          return;

        }

        reject(false);
        return;

      }, (err) => {

        reject(false);
        return;
      });

    });

  }

  // Get Account List Data - for transaction list
  async getAccountList(type: string): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });


    type = type + '&type=transaction';

    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest(type, token).then((response) => {

        console.log(response);

        // not logged in - reauth
        if (response === null || !response) {

          resolve(null);
          return;
        }


        if (response.success) {
          // successful authentication
          console.log('DEBUG2');
          console.log(response);
          resolve(response);
          return;

        }

        if (!response.success && response.message) {
          resolve(response);
          return;

        }

        reject(false);
        return;

      }, (err) => {

        reject(false);
        return;
      });

    });

  }

  // Get Account List Data - for transaction list
  async createNewWallet(name: string): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    const params: { 'name': string } = { name };


    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest('newwallet', token, params).then((response) => {

        // not logged in - reauth
        if (response === null || !response) {

          resolve(null);
          return;
        }


        if (response.success) {
          // successful authentication
          console.log('NEW WALLET');
          console.log(response);
          resolve(response);
          return;

        }

        if (!response.success && response.message) {
          resolve(response);
          return;

        }

        reject(false);
        return;

      }, (err) => {

        reject(false);
        return;
      });

    });

  }

  public async getLRList(type: string, JurisdictionId: number, SectorId: number, Type: number): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    const params: { 'JurisdictionId': number, 'SectorId': number, 'Type': number } = { JurisdictionId, SectorId, Type };

    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest(type, token, params).then((response) => {

        console.log(response);

        // not logged in - reauth
        if (response === null || !response) {

          resolve(null);
          return;
        }


        if (response.success) {
          resolve(response);
          return;

        }

        if (!response.success && response.message) {
          resolve(response);
          return;

        }

        reject(false);
        return;



      }, (err) => {

        reject(false);
        return;
      });

    });

  }

  // Returns My OTC Response data - Seller getting info from potential buyers
  async getAllMySalesOrdersData(asset: string): Promise<any> {

    const params: { 'asset': string } = { asset };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest('listallmysellorders', token, params).then((response) => {

        if (response) {
          // successful return data
          resolve(response);

          return;

        }

        resolve(null);

      }, (err) => {

        reject(false);
      });

    });

  }


  // Returns My OTC Response data - Seller getting info from potential buyers
  async getMyTradeOfferData(type: string, offerid: string): Promise<any> {

    const params: { 'offerid': string } = { offerid };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {
      if (!token) {
        resolve(false);
      }

      this.server.doGetRequest(type, token, params).then((response) => {

        if (response && response.success) {
          // successful return data
          resolve(response);

        } else if (response && !response.success) {

          // successful but not logged in return data
          resolve(response);

        } else if (response && response.data && response.data.state === 0) {
          // authentication error
          resolve(response.data.state);

        } else {

          reject(false);

        }

      }, (err) => {

        reject(false);
      });

    });

  }




  // Returns My OTC Response data - buyer getting info between him/her and seller
  async getMyOffersToBuyData(type: string, offerid: string): Promise<any> {

    const params: { 'Selleruid': string } = { Selleruid: offerid };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });


    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doGetRequest(type, token, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else if (response && response.data && response.data.state === 0) {
          // authentication error
          resolve(response.data.state);

        } else {

          reject(false);

        }

      }, (err) => {

        reject(false);
      });

    });

  }


  // Get Share Advert Data
  public async getMarketList(type: string): Promise<any> {

    let token = null;

    const params = {
      groupby: 'pair'
    };

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise(async (resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      await this.server.doPostRequest(type, token, params).then((response) => {

        console.log('DEBUG1');
        console.log(response);

        // not logged in - reauth
        if (response === null || !response) {
          console.log('NULL RESPONSE AFTER doGetRequest - log in');
          resolve(null);
          return;
        }


        if (response) {
          // successful authentication
          console.log('DEBUG2');
          console.log(response);
          resolve(response);
          return;

        }

        reject(false);
        return;



      }, (err) => {

        reject(false);
        return;
      });

    });

  }

  public checkEmailExists(params: { email: string }): Promise<any> {

    return new Promise((resolve, reject) => {

      this.server.doPostRequest('userexist', null, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else {
          reject(response);

        }

      }, (err) => {

        reject(false);
      });

    });

  }

  public async processWithdrawRequest(amount: string, currency: string): Promise<any> {

    const params: { Currency: string, Amount: string } = { Currency: currency, Amount: amount };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });
    return new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }
      this.server.doPostRequest('withdraw', token, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else {
          reject(response);

        }

      }, (err) => {

        reject(false);
      });

    });

  }



  // Login Api
  public bioMetriclogin(params: {}): Promise<any> {

    return new Promise((resolve, reject) => {

      this.server.doPostRequest('checkBiometric', null, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else if (response && response.data && response.data.state === 0) {
          // authentication error
          resolve(response);

        } else {
          reject(false);

        }

      }, (err) => {

        reject(false);
      });

    });

  }



  // Login Api
  public login(params: {}): Promise<any> {

    return new Promise((resolve, reject) => {

      this.server.doPostRequest('auth', null, params).then((response) => {

        if (response) {
          resolve(response);
          return;
        } else {
          reject(false);
          return;
        }

      }, (err) => {

        reject(false);
      });

    });

  }


  // store profile data temporarily
  public storeItem(name: string, value: any) {

    Storage.set({ key: name, value: value }).then(() => {
      return true;
    });

  }

  // uploads KYC image
  public async uploadKYCImage(image: string, temptoken: string, lrid: string, description: string): Promise<any> {

    const filename = "L_RID_" + lrid;
    const descr = "description[" + filename + "]";

    const params = {
      token: temptoken
    };

    params[descr] = description;
    params[filename] = await encodeURIComponent(image);

    return new Promise((resolve, reject) => {
      this.server.doPostRequest('kycsave', temptoken, params).then((response) => {
        resolve(response);
      }, (err) => {
        reject(err);
      });
    });

  }


  // Get Keywords
  public getRandomWords(): Promise<any> {

    const params = {
      ver: '1.0',
      lang: 'eng',
      number: '12'
    };

    return new Promise((resolve, reject) => {
      this.server.doPostRequest('randomwords', null, params).then((response) => {
        resolve(response);
      }, (response) => {
        reject(response);
      });
    });
  }


  // Register Api
  public register(email: string, password: string, countryId: number, tags: string | boolean): Promise<any> {

    const params = {
      email,
      username: email,
      password,
      CountryId: countryId,
      seed: tags,
      autoconfirm: false
    };

    return new Promise((resolve, reject) => {
      this.server.doPostRequest('signup', null, params).then((response) => {
        resolve(response);
      }, (response) => {
        reject(response);
      });
    });
  }

  dismissPopup(): Promise<boolean> {
    if (!this.spinnerPopup) { return; }

    return new Promise((resolve, reject) => {
      try {
        this.spinnerPopup.dismiss();
        resolve(true);
      } catch (err) {
        resolve(false);
        console.log('error message: ' + err.message);
      }
    });
  }

  async createLoadingPopup(message?: string, showText?: boolean) {

    this.spinnerPopup = await this.loadingControl.create({
      cssClass: 'loadingPopup',
      animated: true,
      backdropDismiss: true,
      spinner: null
    });
    await this.spinnerPopup.present();
    return this.spinnerPopup;
  }

  updateLoaderMessage(message: string) {
    // this.spinnerPopup.setContent(message);
    this.createLoadingPopup(message);
  }

  async setShortToast(message: string) {
    const alert = await this.toastCtrl.create({
      message,
      duration: 750,
      position: 'top',
      cssClass: 'toastCss'
    });
    alert.present();
  }

  async setSignupToast(message: string) {
    const alert = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      cssClass: 'longToast',
      buttons: [{
        text: 'Sign up',
        handler: () => {
          Storage.set({ key: "target", value: '1' }).then(() => {
            this.router.navigate(['/auth']);
          });
        }
      }]
    });
    alert.present();
  }

  async setToast(message: string, promptDismiss: boolean = false) {
    const alert = await this.toastCtrl.create({
      message,
      duration: promptDismiss ? 5000 : 3000,
      position: 'top',
      cssClass: 'toastCss'
    });
    alert.present();
  }

  async setPermaToast(message: string) {
    const alert = await this.toastCtrl.create({
      message,
      position: 'middle',
      cssClass: 'longToast',
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: () => {
        }
      }]
    });
    alert.present();
  }


  public async removeTempUserData(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await Storage.remove({ key: 'session_token' });
      resolve(true);
    });

  }


  // Reset Api
  resetPassword(email: string, tags: string | boolean): Promise<any> {

    const params: {} = {
      email,
      seed: tags
    };

    return new Promise((resolve, reject) => {
      this.server.doPostRequest('userreset', null, params).then((response) => {
        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else if (response && response.success) {
          // authentication error
          resolve(response);

        } else {
          reject(response);

        }

      }, (err) => {

        reject(false);
      });

    });

  }

  // Reset Api
  async changePassword(newPass: string, token: string): Promise<any> {

    const params = {
      type: 'savepassword',
      newpassword: newPass
    };

    return await new Promise((resolve, reject) => {

      this.server.doPostRequest('usersecurity', token, params).then((response) => {

        // not logged in - reauth
        if (response === null || !response) {
          resolve(null);
          return;
        }

        if (response) {
          resolve(response);
          return;
        }

        resolve(false);


      }, (err) => {

        reject(false);
      });

    });
  }



  // check token validity
  async checkToken(token: string) {
    console.log('TOKEN CHECK: ' + token);

    return await new Promise(async (resolve, reject) => {
      this.server.doPostRequest('session', token, null).then(async (response) => {
        if (await response) {
          console.log("Response received: ");
          console.log(response);
          resolve(response.success);
          return;
        } else {
          console.log("Response rejected: ");
          resolve(false);
        }

      }, (error) => {
        console.log('userService->checkToken() error caught');
        resolve(false);
      });

    });
  }

  // fetches wallet balances from server - returns data structure
  async refreshWalletBalances() {

    const params: {} = { type: 'balance' };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest('finance', token, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response.data);
          return;

        }
        if (response && response.data && response.data.state === 0) {
          // not logged in
          resolve(null);
          return;

        } else {
          reject(false);
          return;
        }

      }, (err) => {
        reject(false);
        return;
      });

    });

  }


  getToken(key?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let token = null;

      await Storage.get({ key: 'session_token' }).then(async (data: any) => {
        token = await data.value;
      });

      if (token == null) {
        resolve(null);
      }
      if (token) {
        resolve(token);
        return;
      }
      reject(null);
    });
  }



  // Get Investment Data
  async getSellOrderData(type: string, asset: string, step: number, limit: number, include: string): Promise<any> {

    console.log("user.service.getSellOrderData('" + type + "')");

    const curAsset = asset ? asset : ',';

    const params: { 'page': number, 'limit': number, 'include': string, 'asset': string } = { page: step, limit, include, asset: curAsset };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest(type, token, params).then((response) => {

        // not logged in - reauth
        if (response === null || !response) {
          console.log('NULL RESPONSE AFTER doGetRequest - log in');
          resolve(null);
          return;
        }


        if (response) {
          // successful authentication
          console.log('DEBUG');
          console.log(response);
          resolve(response);
          return;

        }

        resolve(false);


      }, (err) => {

        reject(false);
      });

    });

  }

  // enroll Biometric
  async enrollBiometric(temptoken: string, hash: string): Promise<any> {
    if (!temptoken) {
      return;
    }

    const params = { hash };

    const token = temptoken;

    return await new Promise((resolve, reject) => {

      this.server.doPostRequest('enrollFingerprint', token, params).then((response) => {

        // not logged in - reauth
        if (response === null || !response) {
          console.log('NULL RESPONSE AFTER doGetRequest - log in');
          resolve(null);
          return;
        }


        if (response) {
          // successful authentication
          console.log('DEBUG');
          console.log(response);
          resolve(response);
          return;

        }

        resolve(false);


      }, (err) => {

        reject(false);
      });

    });

  }


  // Used to register user
  async storeUserdata(type: string, params: any, token: string): Promise<any> {

    return await new Promise((resolve, reject) => {

      this.server.doPostRequest('usersave', token, params).then((response) => {

        // not logged in - reauth
        if (response === null || !response) {
          resolve(null);
          return;
        }

        if (response) {
          // successful authentication
          resolve(response);
          return;
        }

        resolve(response);

      }, (err) => {
        reject(false);
      });

    });

  }


  // Update User
  async updateUserdata(type: string, fieldname: string, value: string, temptoken?: string): Promise<any> {

    const val = value ? value : "";
    if (!type || !fieldname) { return; }

    const params = { type };
    params[fieldname] = val; // variable key like FirstName/Surname etc.

    let token = temptoken;
    if (!token) {
      this.getToken().then(async (data) => {
        token = await data.value;
      })
    }

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest('usersave', token, params).then((response) => {

        // not logged in - reauth
        if (response === null || !response) {
          console.log('NULL RESPONSE AFTER doGetRequest - log in');
          resolve(null);
          return;
        }

        if (response) {
          // successful authentication
          console.log('DEBUG');
          console.log(response);
          resolve(response);
          return;

        }

        resolve(false);


      }, (err) => {

        reject(false);
      });

    });

  }


  // Get Investment Data
  async doOTCRequest(action: string, OffersUId: string, udata: { 'price'?: number, 'amount'?: number, 'Asset'?: string }): Promise<any> {
    console.log('Accessed user.doOTCRqequest');

    if (!udata.hasOwnProperty('Asset')) { udata.Asset = ','; }

    if (!udata.hasOwnProperty('price')) { udata.price = 0; }

    if (!udata.hasOwnProperty('amount')) { udata.amount = 0; }


    const params: { 'OffersUId': string, 'termsaccepted': number, 'Price'?: number, 'Amount'?: number, 'Asset'?: string } = { OffersUId, Price: udata.price, Amount: udata.amount, termsaccepted: 1, Asset: udata.Asset };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });



    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest(action, token, params).then((response) => {

        console.log('OTC RESPONSE');
        console.log(response);

        resolve(response);

      }, (err) => {

        reject(false);
      });

    });

  }

  // fetch support topic list
  async sendSupportMessage(supportId: string, heading: string, message: string, supporttopic: number): Promise<any> {

    const params: { 'supportid': string, 'header': string, 'msg': string, 'supporttopic': number } = { supportid: supportId, header: heading, msg: message, supporttopic };

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest('addsupport', token, params).then((response) => {

        if (response) {
          // successful return data
          resolve(response);

          return;

        }

        resolve(null);

      }, (err) => {

        reject(false);
      });

    });

  }

  // fetch support message list
  async getSupportMessages(): Promise<any> {

    const params: {} = {};

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return await new Promise((resolve, reject) => {

      if (!token) {
        resolve(null);
        return;
      }

      this.server.doPostRequest('listsupport', token, params).then((response) => {

        if (response && response.success) {
          // successful return data
          resolve(response);

          return;

        }
        resolve(false);

      }, (err) => {

        reject(false);
      });

    });

  }


  // Buy Shares Api
  async doBuyShares(params?: {}): Promise<any> {

    let token = null;

    await Storage.get({ key: 'session_token' }).then(async (data: any) => {
      token = await data.value;
    });

    return new Promise((resolve, reject) => {

      if (!token) {
        resolve(false);
      }

      this.server.doPostRequest('userorder', token, params).then((response) => {

        if (response && response.success) {
          // successful authentication
          resolve(response);

        } else if (response && response.data && response.data.state === 0) {
          // authentication error
          resolve(response);

        } else {
          reject(false);

        }

      }, (err) => {

        reject(false);
      });

    });

  }

  async takePicture(sourceType: PictureSourceType, orientation?: number): Promise<any> {

    const options: CameraOptions = {
      quality: 80,
      sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      allowEdit: false,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      cameraDirection: 0 || orientation
    };

    return new Promise((resolve, reject) => {
      this.camera.getPicture(options).then(async (b64str) => {
        resolve(await b64str);
        return;
      }, (err) => {
        reject(err);
        return;
      });
    });
  }

  processUpload(image, _token, lrid, description): Promise<any> {

    return new Promise(async (resolve, reject) => {
      let token = _token;

      if (token == null) {
        await Storage.get({ key: 'session_token' }).then(res => {
          token = res.value
        });

        if (!token) {
          // not logged in
          reject(false);
        }
      }

      this.uploadKYCImage(image, token, lrid, description).then(async (response) => {
        if (response && response.success) {
          resolve(true);
          return;
        } else {
          if (!response) {
            reject(null);
            return;
          } else {
            resolve(response);
            return;
          }
        }
      }, (err) => {
        reject(err);
      });

    });
  }

  /* ****************** */

  // exits user login page
  public async exitToLoginPage(message?: string, hideMessage?: boolean) {

    const show = !hideMessage ? true : false;

    // const navigationExtras: NavigationExtras = { queryParams: { currentPage: 'auth' } };

    if (!message && show) { message = 'Your session has expired. Please log in again.'; }

    await Storage.remove({ key: 'session_token' });

    this.dismissPopup();

    this.router.navigate(['auth']);
    if (message && show) {
      this.setToast(message);
    }

  }

}

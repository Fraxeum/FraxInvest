import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, MenuController, NavController, NavParams, Platform } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
import { SessionService } from '../providers/session/session.service';
import { UserService } from '../providers/user.service';
// import { FilePath } from '@ionic-native/file-path';
import { HtmlHelpStringsService } from '../providers/html-help-strings.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Camera, CameraOptions, Direction } from '@ionic-native/camera/ngx';
import { OneSignal, OSPermissionSubscriptionState } from '@ionic-native/onesignal/ngx';
// import { FingerprintAIO, FingerprintOptions } from '@ionic-native/fingerprint-aio/ngx';
import { AvailableResult, BiometryType, NativeBiometric } from 'capacitor-native-biometric';

type User = { 'MemberId': string, 'FirstName': string, 'LastName': string, 'IdNo': string, 'IdType': string, 'Gender': string, 'UserName': string, 'Email': string, 'RefBy': string, 'DOB': string, 'Status': string, 'KYCLevel': string, 'CountryId': string, 'Role': string, 'MemberType': string, 'RoleName': string };
type BankAcc = { 'type': string, 'Id': '0', 'Country': string, 'BankName': string, 'AccountNumber': string, 'BranchCode': string };
type KYCItem = { 'MediaId': string, 'linkid': string, L_RID: string, 'LinkTo': string, 'FieldName': string, 'FileURL': string, 'oldname': string, 'Description': string, 'Group': string, 'Type': string, 'Status': string, 'TimeStamp': string, 'Name': string, 'User': string };
type KYCList = Array<KYCItem>;
type KycDocItems = Array<{ name: string, lrid: string, b64img: string }>;
type SectorItem = { 'Id': string, 'SectorId': string, 'L_RID': string, 'RecStatus': string, 'Name': string, 'Mandatory': string, 'ValidTypes': Array<string>, 'Type': string, 'AdminApproved': string, 'FileSize': string, 'CurrencyId': string, 'JurisdictionId': string, 'uploaded'?: boolean, 'status'?: string };
type SectorList = Array<SectorItem>;
type EditTracker = Array<{ id: number, state: string }>;

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage {
  @ViewChild('docsForm') docsForm: ElementRef;

  currentPage = 'personal';
  darkTheme = false;

  pages: Array<{ page: string }> = [{ page: 'personal' }, { page: 'docs' }, { page: 'banking' }];
  cPage = 0;
  countries: Array<{ name: string, id: number, selected: boolean }>;
  user: User;
  banking: BankAcc;
  docs: { 'VerificationLevel': string, 'KYCLevel': string };
  security: { 'fa2': string, 'ipaddress': string };
  referral: { 'referral': string };
  fieldState: EditTracker = null;
  kycList: KYCList;
  sectorList: SectorList;
  KycDocItems: KycDocItems;
  bankingLoaded = false;

  oneSignalId = "";

  oneSignal: OneSignal;
  state: OSPermissionSubscriptionState;
  debug: string;
  debug2: string;
  debug3: string;
  showNotificationToggle = true;

  currentBankName: string;
  direction = -5;
  actionSheet: any;
  image: string;

  notificationLabel = "Enable notications";
  notificationPermission = false;
  notificationSetting = false;

  biometricLabel = "Enable biometric access";
  biometricState = false;

  uploadResponse = '';
  showDocsLists = false;

  showDocsReceivedHeading = false;
  showDocsRequiredHeading = false;
  editedItemId = 0;

  pnSubState = null;
  biometricAvailable = false;
  private biometricKey = "";

  sessionToken = null;
  userdata = null;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    // public session: SessionService,
    public userProv: UserService,
    public router: Router,
    public location: Location,
    public actionSheetCtrl: ActionSheetController,
    //public storage: Storage,
    public helpStrings: HtmlHelpStringsService,
    public statusBar: StatusBar,
    public camera: Camera,
    onesignal: OneSignal,
    public platform: Platform,
    // public biometric: FingerprintAIO
  ) {
    this.oneSignal = onesignal;
    const darkTheme = localStorage.getItem('darkTheme');
    this.darkTheme = darkTheme === '1' ? true : false;

    const navigation = this.router.getCurrentNavigation().extras.state !== undefined ? this.router.getCurrentNavigation().extras.state.currentPage : 'personal';
    this.currentPage = navigation;

    this.initVariables();

    platform.ready().then(() => {
      Storage.get({ key: "session_token" })
        .then(
          async (token) => {
            this.sessionToken = await token.value;
          })
        .then(
          async () => {
            await this.getUserInfo(this.sessionToken).then(async (userdata) => {
              if (await userdata) {
                console.log(this.userdata);
                this.userdata = userdata;
                this.notificationSetting = this.userdata.fcm;
              } else { // no data received
                this.userProv.setToast("Unable to load userdata from server. Please try again later or contact our team at support@azuzawealth.com");
                this.userProv.exitToLoginPage();
              }
            });
            this.notificationLabel = this.notificationSetting ? "Disable notifications" : "Enable notifications";
          })
        .then(
          async () => {
            await this.populateVariables();
          })
        .then(
          async () => {
            await this.initOneSignal().then(async () => {
              await this.getOneSignalId().then(async (response) => {
                if (await response) {
                  this.oneSignalId = response.userId;
                } else {
                  this.oneSignalId = "";
                }
              });
            });
          })
        .then(async () => {
          await this.checkBiometricAvailable().then((result) => {
            this.biometricAvailable = result;
          });
        });
    });
  }

  getBiometricLabel() {
    return this.biometricState ? "Disable biometrics" : "Enable biometrics";
  }

  checkBiometricAvailable(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await NativeBiometric.isAvailable().then((result: AvailableResult) => {
          const isAvailable = result.isAvailable;
          if (isAvailable) {
            resolve(true);
            return;
          }
        }, err => {
          resolve(false);
          return;
        });
      } catch (error) {
        resolve(false);
        return;
      }
    });
  }


  async setupNotificationVars() {
    // this.state = status;
    this.notificationLabel = this.notificationSetting ? "Disable notifications" : "Enable notifications";
    await this.setNotificationPermission();
    return;
  }



  setNotificationPermission() {
    if (!this.state || !this.state.permissionStatus || !this.state.permissionStatus.state) {
      this.notificationPermission = false;
      return;
    }

    if (this.platform.is("ios")) {
      this.notificationPermission = this.state.permissionStatus.status === 2 ? true : false;
    }

    if (this.platform.is("android")) {
      this.notificationPermission = this.state.permissionStatus.state === 1 ? true : false;
    }

  }

  async toggleBiometricState() {
    if (this.biometricState) { // currently on, switch off
      await this.unlistBiometric();
      return;
    }
    // currently off - switch on
    await this.enrollBiometric();
    return;
  }

  async unlistBiometric() {
    this.biometricKey = "";
    await this.registerBiometrics().then(
      async (result) => {
        if (result && result.data && !result.data.enrolled) {
          this.biometricState = result.data.enrolled;
          await Storage.set({ key: "biostate", value: result.data.enrolled });
        }
      },
      err => { });
  }

  async enrollBiometric() {

    this.enrollFingerPrint()
      .then(async (result) => {
        if (await !result) {
          this.biometricState = false;
          this.biometricLabel = this.getBiometricLabel();
          return;
        }

        this.biometricKey = result;

        this.registerBiometrics().then(
          async (result) => {
            if (result && result.data && result.data.enrolled) {
              this.biometricState = result.data.enrolled;
              this.biometricLabel = this.getBiometricLabel();
              await Storage.set({ key: "biostate", value: result.data.enrolled });
            }
          },
          err => { });
      }, (err) => {
        console.log("Enrollment error: ");
        console.log(err);
        console.log(JSON.stringify(err));
        this.biometricKey = "";
      });

  }


  randomString(len): string {
    let str = "";                                // String result
    for (let i = 0; i < len; i++) {              // Loop `len` times
      let rand = Math.floor(Math.random() * 62); // random: 0..61
      const charCode = rand += rand > 9 ? (rand < 36 ? 55 : 61) : 48; // Get correct charCode
      str += String.fromCharCode(charCode);      // add Character to str
    }
    return str; // After all loops are done, return the concatenated string
  }

  async enrollFingerPrint(): Promise<any> {


    // return new Promise((resolve, reject) => {
    //   this.biometric.registerBiometricSecret(options)
    //     .then(async (result) => {
    //       if (result === 'biometric_success') {
    //         resolve(options.secret);
    //         return;
    //       }
    //       this.userProv.setToast("Biometric registration failed: " + result);
    //       resolve(false);
    //     }, (err) => {
    //       resolve(false);
    //     });

    // });


    // const options = {
    //   username: await this.randomString(128),
    //   password: await this.randomString(10),
    //   server: 'com.azuzawealth.za',
    // };

    // return new Promise((resolve, reject) => {
    //   NativeBiometric.setCredentials(options)
    //     .then(async (result) => {
    //       await result;
    //       this.regData.biometricKey = await options.username;
    //       resolve(true);
    //     }, (err) => {
    //       this.regData.biometricKey = "";
    //       resolve(false);
    //     });
    // })

  }

  async registerBiometrics(): Promise<any> {
    // empty biometric key switches FA2 variable to false
    const token = await this.userProv.getToken();
    return this.userProv.enrollBiometric(token, this.biometricKey);
  }

  async toggleNotificationPermission() {

    this.notificationSetting = !this.notificationSetting;

    if (!this.notificationSetting) {
      await this.userProv.updateUserdata('general', 'fcm', "", this.sessionToken);
      await this.oneSignal.setSubscription(false);
      this.setupNotificationVars();
      return;
    }

    await this.oneSignal.setSubscription(true);
    // fetch updated permissions

    await this.getOneSignalId().then(async (response) => {
      if (await response) {
        this.oneSignalId = response.userId;
      } else {
        this.oneSignalId = "";
      }
    });

    await this.userProv.updateUserdata('general', 'fcm', this.oneSignalId, this.sessionToken);
    this.setupNotificationVars();

  }

  async initOneSignal(): Promise<any> {
    const iosSettings = { kOSSettingsKeyAutoPrompt: true, kOSSettingsKeyInAppLaunchURL: false };

    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        if (this.platform.is("android")) {
          this.oneSignal.startInit('3bff0349-393f-485c-836a-d4d2e54c2123', '670764185793');
        }
        if (this.platform.is("ios")) {
          this.oneSignal.startInit('3bff0349-393f-485c-836a-d4d2e54c2123');
        }
      }

      this.oneSignal.iOSSettings(iosSettings);

      this.oneSignal.endInit();

      resolve(true);
    });
  }

  async getOneSignalId(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.oneSignal.getIds()
        .then(
          async response => {
            resolve(response);
          },
          error => {
            // problem retrieving userId
            resolve(false);
          });
    });
  }

  async getOneSignalSubsState(): Promise<OSPermissionSubscriptionState> {
    return new Promise((resolve, reject) => {
      this.oneSignal.getPermissionSubscriptionState()
        .then(
          async response => {
            resolve(await response);
          },
          error => {
            // problem retrieving userId
            reject(null);
          });
    });
  }

  editMode(id: number, event: string) {
    this.editedItemId = id;
    this.fieldState[id].state = event;
  }


  checkMoreDocsRequired(): boolean {
    if (!this.sectorList || this.sectorList.length < 1) {
      return false;
    }
    let element: SectorItem = null;
    const BreakException = {};
    let i = 0;
    try {
      for (element of this.sectorList) {
        if (!this.sectorList[i].uploaded) {
          throw BreakException;
        }
        ++i;
      }
    } catch (err) {
      return false;
    }
    return true;
  }


  resetInputControls() {
    if (!this.docsForm.nativeElement.elements || this.docsForm.nativeElement.elements.length < 1) { return; }
    let element = "";
    let i = 0;
    for (element of this.docsForm.nativeElement.elements) {
      this.docsForm.nativeElement.elements[i].value = '';
      ++i;
    }
  }

  // Photo code for KYC
  async selectImage(type: any, itemId: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Choose photo source",
      cssClass: "action-sheet-bg",
      buttons: [{
        text: 'Take new photo',
        cssClass: 'cs_camera',
        handler: () => {
          // take picture and upload
          this.getImage(type, itemId, 1/*CAMERA*/);
        }
      }, {
        text: 'Select from gallery',
        cssClass: 'cs_gallery',
        handler: () => {
          // take picture and upload
          this.getImage(type, itemId, 0/*LIBRARY*/);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'cs_cancel',
      }]
    });
    await actionSheet.present();
  }

  getImage(type: any, itemId: number, source: number) {
    this.userProv.takePicture(source).then(async (b64str: string) => {
      const imgdata = "data:image/jpeg;base64," + await b64str;
      this.KycDocItems[this.getKYCItemId(type)].b64img = "I";

      this.userProv.processUpload(imgdata, null, this.KycDocItems[itemId].lrid, this.KycDocItems[itemId].name).then(
        success => {
          this.KycDocItems[this.getKYCItemId(type)].b64img = "U";
          this.checkDocsUploaded();
        },
        failed => {
          this.KycDocItems[this.getKYCItemId(type)].b64img = "";

          if (failed === false) {
            // session error
            this.userProv.exitToLoginPage();
            return;
          }

          if (failed == null) {
            this.userProv.setToast("Network failure. Please check your Internet connection and try again.");
            return;
          }
          this.userProv.setToast(failed.message);
        });
    }, error => {
      this.KycDocItems[this.getKYCItemId(type)].b64img = "";
      this.userProv.setToast("Upload failed. Please try again or contact Azuza support (support@azuzawealth.com)");
      return;
    });
  }

  getKYCItemId(type: string): number {
    let kycItem = 0;
    switch (type) {
      case "ID": { kycItem = 0; break; }
      case "IDB": { kycItem = 1; break; }
      case "PoA": { kycItem = 2; break; }
      case "PoB": { kycItem = 3; break; }
    }
    return kycItem;
  }

  print(item) {
    console.log(JSON.stringify(item));
  }

  // Checks if a document has been uploaded and approved
  checkDocsUploaded() {
    const BreakException = {};

    this.sectorList.forEach((element: SectorItem) => {

      try {
        this.kycList.forEach((kycelement: KYCItem) => {

          if (element.L_RID === kycelement.L_RID) {

            if (kycelement.Status === 'A' || kycelement.Status === 'N') {
              element.uploaded = true;
            } else if (kycelement.Status === 'R') {
              element.uploaded = false;
            }
            throw BreakException;
          }

        });
      } catch (e) {

      }

    });
  }


  async saveChanges(type: string, name: string, id: number) {
    if (!name) {
      const msg = 'The ' + name + 'field is mandatory';
      this.userProv.setToast(msg);
      return;
    }

    // set spinner
    this.editMode(id, "I");

    switch (name) {
      case 'First name':
        this.doUpdateField(type, 'FirstName', this.user.FirstName, name).then(response => {
          this.editMode(id, "S");
          setTimeout(() => {
            this.editMode(id, null);
          }, 1000);
        }, err => { });
        break;
      case 'Last name':
        this.doUpdateField(type, 'LastName', this.user.LastName, name).then(response => {
          this.editMode(id, "S");
          setTimeout(() => {
            this.editMode(id, null);
          }, 1000);
        }, err => { });
        break;
      case 'Username':
        this.doUpdateField(type, 'UserName', this.user.UserName, name).then(response => {
          this.editMode(id, "S");
          setTimeout(() => {
            this.editMode(id, null);
          }, 1000);
        }, err => { });
        break;
    }

  }


  doUpdateField(type: string, name: string, value: string, field_label: string, hideMsg?: boolean): Promise<any> {
    const showToast: boolean = hideMsg ? true : false;

    return new Promise(async (resolve, reject) => {
      await this.userProv.updateUserdata(type, name, value).then(
        response => {
          console.log(response);
          resolve(response);
        },
        err => {
          console.log('ERROR: saveChanges()');
          reject(err);
        });
    });
  }

  async handleSwipe(event) {

    console.log(event);

    if (event.direction === this.direction) { return; } // illiminates pan multi-triggers

    const dir = (this.direction = event.direction);

    console.log('this is dir: ' + dir);

    await this.swipeToPage(dir).then((pageNo) => {

      console.log(pageNo);
      if (isNaN(Number(pageNo))) { return; }

      setTimeout(() => {
        this.cPage = pageNo;
        this.showPage(pageNo);
        this.direction = -5;

      }, 100);
      return;
    });

  }

  async swipeToPage(direction: number): Promise<any> {

    return new Promise((resolve, reject) => {
      let nextPage: number = this.cPage;
      console.log('starting point: ' + this.cPage);

      if (direction === 4) {
        nextPage = nextPage - 1;
        nextPage = (nextPage < 0) ? 0 : nextPage;
        console.log(this.pages[nextPage].page);
        resolve(nextPage);
      }
      if (direction === 2) {
        nextPage = nextPage + 1;
        nextPage = nextPage > 2 ? 2 : nextPage; // >3 ? 3 when security tab is ready
        console.log(this.pages[nextPage].page);
        resolve(nextPage);
      }
    });

  }

  showPage(pageNo: number) {
    this.cPage = pageNo;
    this.currentPage = this.pages[pageNo].page;
  }


  initVariables() {
    this.fieldState = [{ id: 0, state: null }, { id: 1, state: null }, { id: 2, state: null }, { id: 3, state: null }];
    this.countries = [{ name: '', id: 0, selected: false }];
    this.user = { MemberId: '', FirstName: '', LastName: '', IdNo: '', IdType: '', Gender: '', UserName: '', Email: '', RefBy: '', DOB: '', Status: '', KYCLevel: '', CountryId: '', Role: '', MemberType: '', RoleName: '' };
    this.banking = { type: '', Id: '0', Country: '', BankName: '', AccountNumber: '', BranchCode: '' };
    this.docs = { VerificationLevel: '', KYCLevel: '' };
    this.security = { fa2: '', ipaddress: '' };
    this.referral = { referral: '' };
    this.kycList = [{ MediaId: '', linkid: '', L_RID: '', LinkTo: '', FieldName: '', FileURL: '', oldname: '', Description: '', Group: '', Type: '', Status: '', TimeStamp: '', Name: '', User: '' }];
    this.sectorList = [{ Id: '', SectorId: '', L_RID: '', RecStatus: '', Name: '', Mandatory: '', ValidTypes: [''], Type: '', AdminApproved: '', FileSize: '', CurrencyId: '', JurisdictionId: '' }];
    // Specific to South Africa
    this.KycDocItems = [
      { name: "Proof of ID", lrid: "41", b64img: "" },
      { name: "ID Card (Back)", lrid: "42", b64img: "" },
      { name: "Proof of Address", lrid: "43", b64img: "" },
      { name: "Proof of Bank", lrid: "44", b64img: "" }];
    this.biometricLabel = this.getBiometricLabel();
  }

  async populateVariables() {


    this.user = this.userdata.general;
    this.bankingLoaded = this.userdata.BankingLoaded;
    this.banking = this.userdata.bank;
    // this.docs = { VerificationLevel: this.userdata.VerificationLevel, KYCLevel: this.userdata.KYCLevel };
    this.security = { fa2: this.userdata.fa2, ipaddress: this.userdata.ip };
    this.referral = this.userdata.referral;
    this.biometricState = this.userdata.bio ? true : false;
    this.biometricLabel = this.getBiometricLabel();


    this.getLRList().then(async (data) => {
      if (data) {
        this.sectorList = await data;
      }
    })
      .then(async () => {
        await this.getKYCList().then(async (data) => {
          if (data) {
            this.kycList = await data;
          }
        });
      })
      .then(() => {
        this.primeSectorList().then(() => {
          this.showDocsLists = true;
          this.showDocsRequiredHeading = this.checkMoreDocsRequired();
          console.log('More docs required getList: ' + this.showDocsRequiredHeading);
        });
      });
  }

  // silent fetch - get both Sectorlist data
  async getLRList(): Promise<any> {

    /*
    * getLRList takes three additional params JurisdictionId (1=south africa), SectorId (13=Startups), Type (3=consumer LR requirements)
    */

    const jurisdictionId = 1; //JurisdictionId (1=south africa)
    const sectorId = 1; // SectorId (1=Startups) // 13 for DEV
    const lrType = 3; // 3=consumer LR requirements

    return this.userProv.getLRList('sectorlrlist', jurisdictionId, sectorId, lrType).then(async (data) => {

      return new Promise((resolve, reject) => {
        if (!data || (!data.success && data.code === '1000')) {
          this.userProv.exitToLoginPage();
          resolve(false);
        }

        if (data.data) {
          if (data.data.length > 0) {
            this.showDocsReceivedHeading = true;
          }
          resolve(data.data);
        } else { resolve(false); }

      });
    }, (data) => {
    });
  }

  // silent fetch - get both Sectorlist data
  async getKYCList(): Promise<any> {

    /*
    * getLRList takes three additional params JurisdictionId (1=south africa), SectorId (13=Startups), Type (3=consumer LR requirements)
    */

    return this.userProv.getKYCList('KYCList').then(async (data) => {

      return new Promise((resolve, reject) => {
        if (!data || (!data.success && data.code === '1000')) {
          this.userProv.exitToLoginPage();
          resolve(false);
        }

        if (data.data) {

          resolve(data.data);
        } else { resolve(false); }

      });
    }, (data) => {
    });
  }


  async primeSectorList(): Promise<boolean> {
    let v: string = null;

    return new Promise((resolve, reject) => {
      this.sectorList.forEach(async (element) => {
        element.uploaded = false;
        element.status = 'N';

        v = await this.checkKYCList(element.L_RID);

        if (v) {
          element.uploaded = true;
          element.status = v;
        }

      });

      resolve(true);
    });
  }

  // checks if this user has submitted docs for this legal and regulatory (L_R) requirement id
  checkKYCList(lrid: string): string {
    if (!this.kycList || !(this.kycList.length > 0) || !lrid) { return; }
    const BreakException = {};

    let v = "";
    try {
      this.kycList.forEach((element) => {

        if (element.L_RID === lrid) {
          v = element.Status;
          throw BreakException;

        }
      });
    } catch (e) {
      return v;
    }
    return null;
  }




  showHelp() {
    this.openModal();
  }


  async openModal() {
    let helpScreen: any = null;
    let helpText = null;
    this.currentPage = 'home';
    console.log('currentPge', this.currentPage);

    this.helpStrings.getHtmlString(this.currentPage).then(async (text: string) => {
      helpText = await text;
      console.log('this is helpText: ' + helpText); // Help string return nog Null
      if (helpText == null) {
        helpText = '<h3>Under construction</h3><p class=\'text-white\'>No help content created for this page yet</p>';
      }

      helpScreen = await this.userProv.getInstructionsPage(helpText);
      await helpScreen.present();
      this.showPage(0);
    });

  }

  themeSwitch() {
    this.darkTheme = !this.darkTheme;
    const body = document.getElementsByTagName('body')[0];
    if (this.darkTheme) {
      body.classList.add('dark-mode');   // add the class
    } else {
      body.classList.remove('dark-mode');   // remove the class
    }
    localStorage.setItem('darkTheme', this.darkTheme ? '1' : '0');
    console.log('darkTheme', this.darkTheme);
    if (this.darkTheme) {
      this.statusBar.backgroundColorByHexString('#233040');
    } else {
      this.statusBar.backgroundColorByHexString('#2c5074');
    }
  }

  // gets userdata for auto login if session is still valid
  async getUserInfo(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userProv.getUserInfo(token).then(async (response: any) => {
        if (await response && response.success && response.data) {
          resolve(response.data);
          return;
        }
        resolve(false);
      }, err => {
        console.log("NO USER DATA RECEIVED. Returning. ");
        resolve(false);
      });
    });
  }


  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu');
  }

}

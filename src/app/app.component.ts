import { Component } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Router, Route } from '@angular/router';
import { UserService } from './providers/user.service';
import { OneSignal, OSNotification, OSNotificationPayload, OSPermissionSubscriptionState, OSNotificationOpenedResult } from '@ionic-native/onesignal/ngx';
import { Storage } from '@capacitor/storage';


export interface MenuItem {
  title: string;
  component: any;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {

  nextPage = 'auth';
  showInitial = false;
  sessionToken: string;

  public selectedIndex = 0;

  intervalId: any;

  azuzaicon: string;
  // onesignal vars
  state: OSPermissionSubscriptionState;

  userdata: null;

  constructor(
    public platform: Platform,
    //public storage: Storage,
    public router: Router,
    public menu: MenuController,
    public user: UserService,
    public alertController: AlertController,
    public oneSignal: OneSignal,
    public deeplinks: Deeplinks
  ) {
    // SplashScreen.show({
    //   autoHide: false
    // });
    this.startApp();
    // Storage.create()
    this.platform.ready().then(async () => {
      setTimeout(() => {
        SplashScreen.hide();
      }, 1000 * 2);
    })
  }

  async startApp() {
    // init app once platform is ready and storage is ready.
    this.platform.ready()
      .then(async () => {
        Storage.remove({ key: "session_token" }); // set to remove any possible old session re-use security breach
        this.menu.enable(false, "main");
        await this.initializeApp();
        // })
        // .then(async () => {
        await this.setupOneSignal();
        // })
        // .then(() => {
        // this.router.navigate([this.nextPage]).then(async () => {
        // });
      });
    return;
  }

  // init push notifications
  setupOneSignal(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let oneSignalId: string = null;
      this.initOneSignal().then(() => {
        this.getOneSignalId().then(async (response) => {
          if (response) {
            oneSignalId = response.userId;
            await Storage.set({ key: "uid", value: oneSignalId }).then(() => {
              resolve(true);
              return;
            });
          } else {
            oneSignalId = "";
            resolve(false);
            return;
          }
        });
      });
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

  setTheme() {
    // this.statusBar.overlaysWebView(false);
    return;
    /* Theme disabled as it isn't present anymore in app settings
    this.statusBar.styleDefault();
    const body = document.getElementsByTagName('body')[0];
    const darkTheme = localStorage.getItem('darkTheme');
    if (darkTheme === '1') {
      body.classList.add('dark-mode');   // add the class
      this.statusBar.backgroundColorByHexString('#233040');
    } else {
      body.classList.remove('dark-mode');   // remove the class
      this.statusBar.backgroundColorByHexString('#2c5074');
    }
    */
  }

  // checks if this user is logged in with active session
  async checkUserLoginState(): Promise<boolean> {

    return new Promise((resolve, reject) => {

      /* auto login is no longer possible as it poses a potential security risk */

      resolve(false);
      return;
      /*
      let autoLoginEnabled = false;
      let sessionDetected = false;
  
      // limits login to only execute after first successful login
      Storage.get("autologin")
        .then(async (response) => {
          autoLoginEnabled = await response ? true : false;
        }, (err) => {
          autoLoginEnabled = false;
        })
        .finally(() => {
          if (!autoLoginEnabled) {
            resolve(false);
            return;
          }
        });
  
      Storage.get("session_token").then(async (token) => {
        if (await token) {
          await this.checkTokenState(token)
            .then(
              async (result: boolean) => {
                sessionDetected = await result ? result : false;
              }, err => {
                sessionDetected = false;
              })
            .finally(() => {
              resolve(sessionDetected);
            });
        }
        resolve(false);
  
      }, err => {
        resolve(false);
      });*/
    });
  }

  async getOneSignalSubsState(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.oneSignal.getPermissionSubscriptionState()
        .then(
          state => {
            const userId = state.subscriptionStatus.userId;
            resolve(userId);
            return;
          },
          error => {
            // problem retrieving userId
            reject(false);
          });
    });
  }


  setAzuzaIcon(): string {
    if (this.platform.is("cordova")) {
      if (this.platform.is("android")) {
        return "svg/md-azuzaicon.svg";
      }
      if (this.platform.is("ios")) {
        return "svg/ios-azuzaicon.svg";
      }
    }
    return "assets/custom-ion-icons/md-azuzaicon.svg";
  }

  /* One Signal is setup once device/platform is ready */
  async initOneSignal() {
    const iosSettings = { kOSSettingsKeyAutoPrompt: true, kOSSettingsKeyInAppLaunchURL: false };

    if (this.platform.is("cordova")) {

      if (this.platform.is("android")) {
        await this.oneSignal.startInit('3bff0349-393f-485c-836a-d4d2e54c2123', '670764185793');
      }

      if (this.platform.is("ios")) {
        await this.oneSignal.startInit('3bff0349-393f-485c-836a-d4d2e54c2123');
      }

    }

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.iOSSettings(iosSettings);

    await this.oneSignal.handleNotificationReceived().subscribe((notificationData: OSNotification) => {
      // do something when notification is received
    });


    this.oneSignal.handleNotificationOpened().subscribe((notificationData: OSNotificationOpenedResult) => {
      if (notificationData && notificationData.notification &&
        notificationData.notification.payload && notificationData.notification.payload.body) {
        this.user.setPermaToast(notificationData.notification.payload.body);
      }
    });

    await this.oneSignal.endInit();
  }


  async checkTokenState(token: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.user.checkToken(token).then(async (response: any) => {
        if (await response) {
          resolve(true);
          return;
        } else {
          resolve(false);
          return;
        }
      }, (response: any) => {
        resolve(false);
      });
    });
  }



  async logout() {
    this.menu.close();
    this.reAuth(null, false);
  }


  async initializeApp() {

    this.azuzaicon = await this.setAzuzaIcon();
    this.nextPage = "auth";

    return;

    /* Auto login disable as it poses a potential security threat
    await this.checkUserLoginState().then(
      async (state) => {
        if (await state) { // user session valid, bypass login
          this.nextPage = 'home';
          await this.setIntervalSessionCheck();
        }
  
        if (this.nextPage === 'register-1') {
          this.nextPage = "auth";
        }
  
      },
      err => {
        this.nextPage = "auth";
      });
      */
  }

  showExitConfirm() {
    this.alertController.create({
      header: 'Close Azuza',
      message: 'You are about to close the Azuza app, press "Close" to continue',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        handler: () => {
        }
      }, {
        text: 'Close',
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }


  public async reAuth(message?: string, hideMessage?: boolean) {
    const msg = message ? message : null;
    const show = !hideMessage ? true : false;

    this.menu.enable(false, 'main');
    clearInterval(this.intervalId);
    this.user.exitToLoginPage(msg, show);
  }

  public setIntervalSessionCheck() {
    this.intervalId = setInterval(() => {
      if (this.sessionToken) {
        this.checkUserLoginState().then((valid) => {
          if (valid) {
            return true;
          } else {
            this.user.setToast("Your connection to Azuza timed out. Please log in again.");
            this.reAuth();
          }
        });
      }
    }, 60000); // refreshes every 60 seconds
    return;
  }


  openDepositPage() {
    this.menu.enable(false, 'main');
    this.router.navigate(['deposit-money']);
    this.menu.enable(true, 'main');
  }

  openHomePage() {
    this.menu.enable(false, 'main');
    this.router.navigate(['home']);
    this.menu.enable(true, 'main');
  }

  openOTCMarketPlace() {
    this.menu.enable(false, 'main');
    this.router.navigate(['market']);
    this.menu.enable(true, 'main');
  }

  openTransactionHistory() {
    this.menu.enable(false, 'main');
    this.router.navigate(['wallet']);
    this.menu.enable(true, 'main');
  }

  openAccountSetting() {
    this.menu.enable(false, 'main');
    this.router.navigate(['account-settings']);
    this.menu.enable(true, 'main');
  }

  openTransferFunds() {
    this.menu.enable(false, 'main');
    this.router.navigate(['transfer-funds']);
    this.menu.enable(true, 'main');
  }

  openSupport() {
    this.menu.enable(false, 'main');
    this.router.navigate(['supportmsglist']);
    this.menu.enable(true, 'main');
  }

  openReward() {
    this.menu.enable(false, 'main');
    this.router.navigate(['refer']);
    this.menu.enable(true, 'main');
  }

  openAboutPage() {
    this.menu.enable(false, 'main');
    this.router.navigate(['about']);
    this.menu.enable(true, 'main');
  }

}

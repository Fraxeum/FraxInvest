import { Component, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonSlides, MenuController, NavController, IonFab, Platform, ActionSheetController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { UserService } from '../providers/user.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

type socialApps = Array<{ name: string, icon: string, ios_url_scheme: string, android_url_scheme: string, installed: boolean }>;

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('fab') fab: IonFab;

  sending: string = null;
  url: string = null;
  useWeb = false;

  socialApps: socialApps = null;

  noSocial = true;

  constructor(
    public router: Router,
    public platform: Platform,
    public menu: MenuController,
    public socialSharing: SocialSharing,
    public user: UserService,
    public actionSheet: ActionSheetController,
    public browser: InAppBrowser
  ) {
    this.platform.ready().then(() => {
      this.primeObjects();

      this.checkSocialSharingApps().then(result => {
        this.noSocial = false;
      }, err => {
        this.noSocial = true;
      });
    });
  }

  getURIScheme(id): string {
    return this.platform.is("android") ? this.socialApps[id].android_url_scheme : this.socialApps[id].ios_url_scheme;
  }

  async primeObjects() {

    this.socialApps = [
      {
        name: "facebook",
        icon: "logo-facebook",
        ios_url_scheme: "facebook",
        android_url_scheme: "com.facebook.katana",
        installed: false
      },
      {
        name: "twitter",
        icon: "logo-twitter",
        ios_url_scheme: "twitter",
        android_url_scheme: "com.twitter.android",
        installed: false
      },
      {
        name: "whatsapp",
        icon: "logo-whatsapp",
        ios_url_scheme: "whatsapp",
        android_url_scheme: "com.whatsapp",
        installed: false
      },
      {
        name: "instagram",
        icon: "logo-instagram",
        ios_url_scheme: "instagram",
        android_url_scheme: "com.instagram.android",
        installed: false
      }
    ];
  }

  checkSocialSharingApps(): Promise<any> {

    const message = "#azuza";
    const subject = "Azuza";

    return new Promise((resolve, reject) => {
      if (!this.platform.is('cordova')) {
        reject();
      }
      this.socialApps.forEach(async app => {
        await this.socialSharing.canShareVia(this.platform.is('android') ? app.android_url_scheme : app.ios_url_scheme, message, subject, null, null).then(
          (result) => {
            app.installed = true;
          },
          err => {
            app.installed = false;
          });
      });
      resolve(true);
    });
  }

  async showShareActionsheet() {
    const buttons = [];

    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'action-sheet-bg'
    });

    this.socialApps.forEach(app => {
      if (app.installed) {
        buttons.push({
          text: app.name,
          icon: app.icon,
          cssClass: 'cs_gallery',
          handler: () => {
            this.shareToSocial(app.name);
            return;
          }
        });
      }
    });

    this.actionSheet.create({
      header: "Select platform",
      cssClass: 'action-sheet-bg',
      buttons
    }).then((as) => {
      as.present();
    });

  }


  shareToSocial(appName: string) {

    let appPackageName = "";

    switch (appName) {
      case 'facebook':
        appPackageName = this.getURIScheme(0);
        break;
      case 'twitter':
        appPackageName = this.getURIScheme(1);
        break;
      case 'whatsapp':
        appPackageName = this.getURIScheme(2);
        break;
      case 'instagram':
        appPackageName = this.getURIScheme(3);
        break;
    }

    const fileUrl = 'https://azuzawealth.com/social/' + appName + '/socialshare.png';


    const options = {
      message: '#MicroInvest #Azuza #EcoFriendly #LoveTheEarth', // not supported on some apps (Facebook, Instagram)
      subject: 'Azuza Micro Investment', // fi. for email
      files: [ fileUrl ], // an array of filenames either locally or remotely
      url: 'https://azuzawealth.com/',
      chooserTitle: 'Where to share', // Android only, you can override the default share sheet title
      appPackageName: appName, // Android only, you can provide id of the App you want to share with
      iPadCoordinates: '0,0,0,0' // IOS only iPadCoordinates for where the popover should be point.  Format with x,y,width,height
    };

    this.socialSharing.shareWithOptions(options).then((success) => {
      this.user.setToast("Thank you for sharing Azuza :-)");
      return;
    },
    (err) => {
      return;
    });
  }

  launchExternalWebsite(option: string) {
    let url: string;

    switch (option) {
      case "terms-of-use":
        url = "https://azuzawealth.com/legal/terms.html";
        break;
      case "privacy-policy":
        url = "https://azuzawealth.com/legal/privacy.html";
        break;
      case "visit-azuza":
        url = "https://azuzawealth.com/";
        break;
    }
    if (url) {
     // window.open(url, '_system', 'location=yes');
     const browser = this.browser.create(url, "_system");
    }
    return;
  }

  getTopicDetail(selTopic: string) {
    switch (selTopic) {
      case "raise-capital":
        return {
          topicId: 11,
          heading: "Azuza Listings",
          text: "Need capital to fund high growth in your eco-friendly startup in the green or sustainable technology space? Speak to us about raising capital on Azuza."
        };
        break;
      case "azuza-bib":
        return {
          topicId: 10,
          heading: "Fraxeum Sales",
          text: "Got a great idea for a fractional investment product - or want to start Azuza in a different region? Speak to Fraxeum sales for information."
        }; // fraxeum sales
        break;
      case "get-info":
        return {
          topicId: 9,
          heading: "Request Information",
          text: "Connect with us! We're here to help."
        }; // general
        break;
        case "invest":
          return {
            topicId: 9,
            heading: "Investor enquiries",
            text: "Join us on the forefront of the global financial evolution!"
          }; // general
          break;
    }
  }

  callme(topicString: string) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        topic: this.getTopicDetail(topicString)
      }
    };
    this.router.navigate(["supportmsglist"], navigationExtras);
  }

}

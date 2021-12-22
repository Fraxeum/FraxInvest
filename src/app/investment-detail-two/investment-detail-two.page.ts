import { Component, ViewChild, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IonFab, ActionSheetController, Platform, ModalController, IonRouterOutlet } from '@ionic/angular';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { HtmlHelpStringsService } from '../providers/html-help-strings.service';
import { UserService } from '../providers/user.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { VideoModalPage } from '../video-modal/video-modal.page';
import { Storage } from '@capacitor/storage';

type TermsObj = { 'terms1': boolean, 'terms2': boolean, 'terms3': boolean, 'terms4': boolean };
type FiatObject = { 'FundId': string, 'SPVNAME': string, 'Type': string, 'MemberId': string, 'Currency': string, 'Withdraw': string, 'Deposit': string, 'Spend': string, 'Income': string, 'Available': string, 'escrow_in': string, 'escrow_out': string, 'CurrencySymbol': string, 'CurrencySymbolPos': string, 'CurrencyName': string, 'LocalCurrency': string, 'LocalCurrencySymbol': string, 'LocalCurrencySymbolPos': string, 'Extra': string, 'RecStatus': string, 'locale_id': string, 'currency_code': string };
type AssetObject = { 'FundId': string, 'SPVNAME': string, 'Type': string, 'MemberId': string, 'Currency': string, 'Withdraw': string, 'Deposit': string, 'Spend': string, 'Income': string, 'Available': string, 'escrow_in': string, 'escrow_out': string, 'CurrencySymbol': string, 'CurrencySymbolPos': string, 'CurrencyName': string, 'LocalCurrency': string, 'LocalCurrencySymbol': string, 'LocalCurrencySymbolPos': string, 'Extra': string, 'RecStatus': string, 'locale_id': string, 'currency_code': string, 'Lock': boolean, 'LockEnd': string, 'LegalId': string, 'market': string, 'share_value': string, 'LegalMemberId': string, 'Stats': { 'totalOnOffer': string, 'totalBids': string, 'offerMin': string, 'offerMax': string, 'timestamp': string } };
type ProductImages = Array<{ 'src': string, 'name': string, 'description': string }>;
type OfferVitals = { 'LegalId': string, 'StartDate': string, 'EndDate': string, 'TokensIssued': string, 'TokensAvailable': string, 'TokenBasePrice': string, 'SalesCommission': string, 'TokenSalesPrice': string, 'TokensSold': string, 'TotalDays': string, 'DaysLeft': string, 'HoursLeft': string, 'MinsLeft': string, 'SecondsLeft': string, 'TotalBuyers': string, 'InEscrow': string, 'requestTimeStamp': string };

type newCheckoutObj = {
  'totalShares': number,
  'totalValue': number,
  'fees': number,
  'vehicle': string,
  'terms': TermsObj,
  'confirm': boolean,
  'price'?: number
};
type checkoutObj = {
  'totalShares': number,
  'totalValue': number,
  'fees': number,
  'vehicle': string,
  'terms': boolean,
  'confirm': boolean,
  'price'?: number
};

type socialApps = Array<{ name: string, icon: string, ios_url_scheme: string, android_url_scheme: string, installed: boolean }>;

@Component({
  selector: 'app-investment-detail-two',
  templateUrl: './investment-detail-two.page.html',
  styleUrls: ['./investment-detail-two.page.scss']
})

export class InvestmentDetailTwoPage implements OnInit {

  @ViewChild('fab') fab: IonFab;
  @ViewChild('fab1') fab1: IonFab;

  sessionToken: any = null;

  legalId = 33;
  raiseType = "Hard Target";

  socialApps: socialApps = null;

  debug: any;

  slides = [
    { poster: 'assets/img/client-2/video-splash/puregrow-1.png', url: 'https://www.youtube.com/embed/tPLuMprZBRE' },
    { poster: 'assets/img/client-2/video-splash/puregrow-2.png', url: 'https://www.youtube.com/embed/P1T0wk5-Ckk' },
    { poster: 'assets/img/client-2/video-splash/puregrow-3.png', url: 'https://www.youtube.com/embed/RwkZtDBst6A' },
    { poster: 'assets/img/client-2/video-splash/puregrow-4.png', url: 'https://www.youtube.com/embed/wD6H1T0bQkA' },
    { poster: 'assets/img/client-2/video-splash/puregrow-5.png', url: 'https://www.youtube.com/embed/4gVk9X3nIUU' },
    { poster: 'assets/img/client-2/video-splash/puregrow-6.png', url: 'https://www.youtube.com/embed/UlzJpGWdEz8' }
  ];

  compareImg = 'assets/img/client-2/product/7.png';

  accordionData = null;

  companyName: any;

  param: number;
  images: any;
  descrption: any;
  profileName: any;
  show = false;
  data1: any;

  properties: Array<any>;
  yield: any;
  data: any;
  timezero: any;
  show1 = true;
  show2 = false;
  check: boolean;
  sharesToggle: boolean;
  productImages: ProductImages;
  productUseCaseImages: ProductImages;
  popup: any;

  fiatObjects: Array<FiatObject>;
  assetObjects: Array<AssetObject>;
  vitals: OfferVitals;

  fiatAmount: number;
  sharesAmount: number;
  amount: number;
  public sharePrice: number;
  public fees: number;

  showBuyPopup: boolean;
  showSpinner = false;

  percentComplete: number;
  strokeColour: string;

  hoursToGo: number;
  daysToGo: number;
  ttg: number;

  buyStep: number;

  noSocial = false;

  progress = 0;

  // buy-wizard
  termsAccepted: {
    'terms1': boolean,
    'terms2': boolean,
    'terms3': boolean,
    'terms4': boolean
  };

  transactionObj: checkoutObj;

  // slider 1 opt
  slideOpts = {
    initialSlide: 2,
    slidesPerView: 2,
    loop: true,
    centeredSlides: true,
    spaceBetween: 10,
    preloadImages: true
  };

  // slider 2 opts
  sliderOpts = {
    initialSlide: 2,
    loop: true,
    centeredSlides: true,
    spaceBetween: 15,
    preloadImages: true
  };

  currentPage: any;

  constructor(
    photoViewer: PhotoViewer,
    public actionSheet: ActionSheetController,
    public user: UserService,
    public router: Router,
    public helpStrings: HtmlHelpStringsService,
    public socialSharing: SocialSharing,
    public platform: Platform,
    public sanitizer: DomSanitizer,
    public browser: InAppBrowser,
    public modalCtrl: ModalController,
    public storage: Storage
    ,
    public routerOutlet: IonRouterOutlet
  ) {

    this.primeAssetObjects();

    this.primeObjects();

    this.getLatestVitals().then(
      (complete) => {
        this.checkSocialSharingApps().then(result => {
          this.noSocial = false;
          this.setProgress();
        }, err => {
          this.noSocial = true;
        });
      },
      (err) => {
        this.user.exitToLoginPage();
      });
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }

  // ensures that getProgress isn't called 1 million times at load
  async setProgress() {
    this.progress = await this.getProgress();
  }

  getProgress(): number {
    if (!this.vitals.TokensAvailable && this.vitals.TokensAvailable.length < 1) {
      // error occurred
      return 0;
    }

    const tokensSold = this.toFloat(this.vitals.TokensSold);
    const tokensAvail = this.toFloat(this.vitals.TokensAvailable);

    if (tokensAvail === 0) {
      return -1;
    }

    if (!tokensAvail) {
      return 0;
    }

    if (tokensSold > 0) {
      return Math.floor((tokensSold / tokensAvail) * 100);
    }

    return 0;
  }

  checkSocialSharingApps(): Promise<any> {

    const message = "#azuza";
    const subject = "Azuza";

    return new Promise((resolve, reject) => {
      if (!this.platform.is('cordova')) {
        reject();
      }
      this.socialApps.forEach(async app => {
        let r = "";
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

  async showShareActionsheet(index: number) {
    await this.user.setToast("clicked");
    return;

    const buttons = [];

    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'action-sheet-bg'
    });

    this.socialApps.forEach(app => {
      this.debug += app.installed ? app.name + "= installed | " : app.name + " = " + app.installed + " | ";
      if (app.installed) {
        buttons.push({
          text: app.name,
          icon: app.icon,
          cssClass: 'cs_gallery',
          handler: () => {
            this.shareToSocial(app.name, index);
            return;
          }
        });
      }
    });

    this.debug = JSON.stringify(buttons);

    this.actionSheet.create({
      header: "Select platform",
      cssClass: 'action-sheet-bg',
      buttons
    }).then((as) => {
      as.present();
    });

  }

  shareToSocial(appName: string, index: number) {
    switch (appName) {
      case 'facebook':
        this.socialSharing.shareViaFacebook("#Innovation #Azuza #SocialInvestment #SaveThePlanet #Wealth", this.slides[index].url, "https://instavestcapital.com/");
        this.user.setToast(this.slides[index].url);
        break;
      case 'twitter':
        this.socialSharing.shareViaTwitter("#Innovation #Azuza #SocialInvestment #SaveThePlanet #Wealth", this.slides[index].url, "https://instavestcapital.com/");
        this.user.setToast(this.slides[index].url);
        break;
      case 'whatsapp':
        this.socialSharing.shareViaWhatsApp("#Innovation #Azuza #SocialInvestment #SaveThePlanet #Wealth", this.slides[index].url, "https://instavestcapital.com/");
        this.user.setToast(this.slides[index].url);
        break;
      case 'linkedin':
        this.socialSharing.canShareVia(this.getURIScheme(index), "#Innovation #Azuza #SocialInvestment #SaveThePlanet #Wealth", this.slides[index].url, "https://instavestcapital.com/");
        this.user.setToast(this.slides[index].url);
        break;
      case 'telegram':
        this.socialSharing.canShareVia(this.getURIScheme(index), "#Innovation #Azuza #SocialInvestment #SaveThePlanet #Wealth", this.slides[index].url, "https://instavestcapital.com/");
        this.user.setToast(this.slides[index].url);
        break;
    }

  }

  toFloat(value: any): number {
    if (!value) { return 0; }

    if (typeof value === "string") {
      return parseFloat(value);
    }

    if (typeof value === "number") {
      return value;
    }
    return 0;
  }

  allTermsChecked(terms): Promise<boolean> {
    console.log(terms);

    return new Promise((resolve, reject) => {

      for (const item in terms) {
        if (!terms[item]) {
          resolve(false);
          break;
        }
      }

      resolve(true);

    });

  }

  async playVideo(vId: string) {
    const videoModal = this.user.getVideoPage(this.slides[vId].url, this.slides[vId].poster);
    await videoModal.then((video) => {
      video.present();
    });
  }

  showShareOpts(index: number) {
    this.showShareActionsheet(index);
    this.user.setToast("clicked");

  }


  // Controls the share buy wizard component navigation
  nextStep(dir: number) {
    if (this.fab) {
      this.fab.close();
    }
    if (this.fab1) {
      this.fab1.close();
    }


    if (this.buyStep === 1 && this.transactionObj.totalShares < 1) {
      this.user.setToast('1.Your investment amount is too low. You must buy at least one share.');
      return;
    }

    if (dir > 0) {
      if (this.buyStep + 1 > 3) {
        this.sendTransaction(); return;

      }
      ++this.buyStep;
      return;

    } else {
      if (this.buyStep - 1 < 1) {
        this.buyStep = 1;
        return false;
      }
      --this.buyStep;
    }

  }


  async sendTransaction() {
    if (!this.transactionObj.totalShares) {
      return false;
    }
    this.showBuyPopup = false;
    this.buyStep = 4;
    this.showSpinner = true;
    this.doBuyProcess();
  }


  getStrokeColor(): string {


    if (!this.vitals.DaysLeft || !this.vitals.SecondsLeft || !this.vitals.TotalDays) {

      return '#ffffff';

    }

    if (parseInt(this.vitals.DaysLeft, 10) <= 0) {

      return '#aaafb4';

    }

    let secsLeft: number = parseInt(this.vitals.SecondsLeft, 10);

    secsLeft = 1000;
    const totalDays: number = parseInt(this.vitals.TotalDays, 10);

    const timeLeftPercent: number = (secsLeft / (totalDays * 24 * 60 * 60)) * 100;

    if (timeLeftPercent < 10) {

      return '#ff1100';
    }

    if (timeLeftPercent < 70) {

      return '#9fff00';
    }

    return '#ff1199';

  }

  updateTransactionObj(event: string): void {
    let transObj: newCheckoutObj = null;

    if (event) {
      try {
        transObj = JSON.parse(event);
        this.transactionObj.totalValue = transObj.totalValue;
        this.transactionObj.totalShares = transObj.totalShares;
        this.transactionObj.vehicle = transObj.vehicle;

        console.log(this.transactionObj);

        this.allTermsChecked(transObj.terms).then((result) => {
          this.transactionObj.terms = this.transactionObj.confirm = result;
        });

      } catch (err) {
        console.log('ERROR: UPDATE TRANSCTION OBJECT');
        console.log(err.message);

      }

    }

  }

  getLatestVitals(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.user.requestProductVitals(this.legalId).then(
        async (response) => {
          if (response == null || !response) {
            reject(false);
            return;
          }

          if (!response) {
            reject(false);
            return;
          }

          if (response && response.data) {
            if (response.data.state === 0) {
              reject(false);
              return;
            }

            const vitals: OfferVitals = await response.data;

            await this.setVitalVariables(vitals[0]);

            // set daysLeft to 0 if daysLeft returns negative number
            if (this.vitals && this.vitals.DaysLeft) {
              if (parseInt(this.vitals.DaysLeft, 10) < 1) {
                this.vitals.DaysLeft = '0';

              }
            }

            await this.setStrokeColour();

          }

        }, err => { reject(false); return; })
        .then(() => {

          // add support for offline viewing
          if (!this.sessionToken) {
            this.fiatObjects = [{ FundId: '', SPVNAME: '', Type: '', MemberId: '', Currency: 'ZAR', Withdraw: '', Deposit: '', Spend: '', Income: '', Available: '0.00', escrow_in: '', escrow_out: '', CurrencySymbol: '', CurrencySymbolPos: '', CurrencyName: '', LocalCurrency: '', LocalCurrencySymbol: '', LocalCurrencySymbolPos: '', Extra: '', RecStatus: '', locale_id: '', currency_code: '' }];
            this.assetObjects = [{ FundId: '', SPVNAME: '', Type: '', MemberId: '', Currency: '', Withdraw: '', Deposit: '', Spend: '', Income: '', Available: '', escrow_in: '', escrow_out: '', CurrencySymbol: '', CurrencySymbolPos: '', CurrencyName: '', LocalCurrency: '', LocalCurrencySymbol: '', LocalCurrencySymbolPos: '', Extra: '', RecStatus: '', locale_id: '', currency_code: '', Lock: true, LockEnd: '', LegalId: '', market: '', share_value: '', LegalMemberId: '', Stats: { totalOnOffer: '', totalBids: '', offerMin: '', offerMax: '', timestamp: '' } }];
            resolve(true);
            return;
          }
          // refreshes this user's detailed account balances
          this.user.getAccountBalances().then(async (data) => {

            if (data.data) {
              if (data.data.Fiat) {
                if (data.data.Fiat.length > 0) {
                  this.fiatObjects = await data.data.Fiat;
                } else {
                  this.fiatObjects = [{ FundId: '', SPVNAME: '', Type: '', MemberId: '', Currency: 'ZAR', Withdraw: '', Deposit: '', Spend: '', Income: '', Available: '0.00', escrow_in: '', escrow_out: '', CurrencySymbol: '', CurrencySymbolPos: '', CurrencyName: '', LocalCurrency: '', LocalCurrencySymbol: '', LocalCurrencySymbolPos: '', Extra: '', RecStatus: '', locale_id: '', currency_code: '' }];
                }
              }
              if (data.data.Asset) {
                this.assetObjects = await data.data.Asset;
              } else {
                this.assetObjects = [{ FundId: '', SPVNAME: '', Type: '', MemberId: '', Currency: '', Withdraw: '', Deposit: '', Spend: '', Income: '', Available: '', escrow_in: '', escrow_out: '', CurrencySymbol: '', CurrencySymbolPos: '', CurrencyName: '', LocalCurrency: '', LocalCurrencySymbol: '', LocalCurrencySymbolPos: '', Extra: '', RecStatus: '', locale_id: '', currency_code: '', Lock: true, LockEnd: '', LegalId: '', market: '', share_value: '', LegalMemberId: '', Stats: { totalOnOffer: '', totalBids: '', offerMin: '', offerMax: '', timestamp: '' } }];
              }

              resolve(true);

            }
          });
        });

    });

  }

  setStrokeColour() {
    if (!this.vitals.DaysLeft || !this.vitals.TotalDays) {
      return false;
    }

    const daysLeft: number = parseInt(this.vitals.DaysLeft, 10);

    const totalDays: number = parseInt(this.vitals.TotalDays, 10);

    if (totalDays === daysLeft || totalDays === 0) {
      this.percentComplete = 0;
    } else {
      this.percentComplete = ((totalDays - daysLeft) / totalDays) * 100;
    }

    this.strokeColour = this.getStrokeColor();

  }


  toggleBuyPopupVisibility(): void {
    if (this.sessionToken) {
      this.showBuyPopup = !this.showBuyPopup;
    } else {
      this.user.setSignupToast("Sign up to Azuza to invest in this startup.");
    }
  }

  doRefresh(refresher) {
    // this.showAlldata();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }


  getURIScheme(id): string {
    return this.platform.is("android") ? this.socialApps[id].android_url_scheme : this.socialApps[id].ios_url_scheme;
  }

  async primeObjects() {

    await Storage.get({ key: 'session_token' }).then(res => {
      this.sessionToken = res.value
    });

    this.termsAccepted = {
      terms1: false,
      terms2: false,
      terms3: false,
      terms4: false
    };

    this.transactionObj = {
      totalShares: 0,
      totalValue: 0.00,
      fees: 0.00,
      vehicle: 'spv',
      terms: false,
      confirm: false
    };

    await this.setProductImages();

    this.percentComplete = 0;

    this.strokeColour = '#ffffff';

    this.showBuyPopup = false;

    this.sharesToggle = true; // starts by accepting #Shares

    this.amount = 0;

    this.fiatAmount = this.transactionObj.totalValue;

    this.sharesAmount = this.transactionObj.totalShares;

    this.hoursToGo = 0;

    this.daysToGo = 60;

    this.companyName = 'Infinite Industries';

    this.ttg = this.hoursToGo;

    if (this.percentComplete >= 100) {
      this.ttg = 0;
    }

    this.buyStep = 1;

    this.socialApps = [
      {
        name: "Facebook",
        icon: "logo-facebook",
        ios_url_scheme: "facebook",
        android_url_scheme: "com.facebook.katana",
        installed: false
      },
      {
        name: "LinkedId",
        icon: "logo-linkedin",
        ios_url_scheme: "linkedin",
        android_url_scheme: "com.linkedin.android",
        installed: false
      },
      {
        name: "Telegram",
        icon: "paper-plane",
        ios_url_scheme: "telegram",
        android_url_scheme: "org.telegram.messenger",
        installed: false
      },
      {
        name: "Twitter",
        icon: "logo-twitter",
        ios_url_scheme: "twitter",
        android_url_scheme: "com.twitter.android",
        installed: false
      },
      {
        name: "Whatsapp",
        icon: "logo-whatsapp",
        ios_url_scheme: "whatsapp",
        android_url_scheme: "com.whatsapp",
        installed: false
      }
    ];

    this.accordionData = [
      {
        title: 'Is this company legit?',
        description: 'To list on AZUZA a company is subject to a rigorous due dilligence process performed by Instavest Capital\'s team of chartered accountants. We check and approved everything from company registration to tax clearance, directors fitness to serve to business model feasibility and everything in between. Funds are only released once the company clears this due dilligence.',
        active: false
      },
      {
        title: 'What is the minimum investment amount?',
        description: 'R39. You can buy one share or more.',
        active: false
      },
      {
        title: 'How does buying shares work?',
        description: "This company is enlisted as a Hard Target Raise which means the target raise must be met before shares are transferred to you. Your money is reserved in your escrow wallet until the project reaches the target raise amount for this investment round. A detailed due diligence then carried out to ensure that everything still checks out. Only after this is the money transferred to the SPV and your shares are issued.",
        active: false
      },
      {
        title: 'What if the target is not reached?',
        description: "If the raise target is not met then you get 100% of your money back.",
        active: false
      },
      {
        title: 'What if the due dilligence fails?',
        description: "If the due dilligence fails you get 100% of your money back.",
        active: false
      },
      {
        title: 'Do I have access to my money?',
        description: 'SPV shareholders can offer their shares for sale to other shareholders on the AZUZA traders market. In the app tap on \'Menu\' then \'Trade \'.',
        active: false
      },
      {
        title: 'Are there tax benefits?',
        description: 'South Africans who choose to invest in this company via our Section 12J partner may be able to deduct up to 100% of your investment from your income tax (SARS T&Cs apply). Section 12J shares cannot be traded.',
        active: false
      },
      {
        title: 'Do I have voting rights ?',
        description: 'No. Instavest Capital and its team of highly qualified, experienced individuals manages the SPV on behalf of all shareholders.',
        active: false
      },
      {
        title: 'Is there a financial risk ?',
        description: 'Yes. Any kind of investment is a risk. Early stage investing often poses even greater risk and it is possible that you can lose your entire investment. The AZUZA team will do everything in our power to ensure that your investment is successful, but by buying shares you assume the risk.',
        active: false
      },
      {
        title: 'Can I be held liable for debt ?',
        description: 'No. Your financial risk ends with the amount that you invest. Shareholders cannot be held liable for any debt or losses that the startup may incur.',
        active: false
      },
      {
        title: 'When do I get paid ?',
        description: 'You are paid within two weeks of dividends having been declared and within 48-hours of the company depositing the dividend payment amount to AZUZA.',
        active: false
      }
    ];

    return;

  }

  primeAssetObjects() {
    this.fiatObjects = [{ FundId: '', SPVNAME: '', Type: '', MemberId: '', Currency: 'ZAR', Withdraw: '', Deposit: '', Spend: '', Income: '', Available: '0.00', escrow_in: '', escrow_out: '', CurrencySymbol: '', CurrencySymbolPos: '', CurrencyName: '', LocalCurrency: '', LocalCurrencySymbol: '', LocalCurrencySymbolPos: '', Extra: '', RecStatus: '', locale_id: '', currency_code: '' }];
    this.assetObjects = [{ FundId: '', SPVNAME: '', Type: '', MemberId: '', Currency: '', Withdraw: '', Deposit: '', Spend: '', Income: '', Available: '', escrow_in: '', escrow_out: '', CurrencySymbol: '', CurrencySymbolPos: '', CurrencyName: '', LocalCurrency: '', LocalCurrencySymbol: '', LocalCurrencySymbolPos: '', Extra: '', RecStatus: '', locale_id: '', currency_code: '', Lock: true, LockEnd: '', LegalId: '', market: '', share_value: '', LegalMemberId: '', Stats: { totalOnOffer: '', totalBids: '', offerMin: '', offerMax: '', timestamp: '' } }];
    this.vitals = { LegalId: this.legalId + '', StartDate: '', EndDate: '', TokensIssued: '', TokensAvailable: '', TokenBasePrice: '', SalesCommission: '', TokenSalesPrice: '', TokensSold: '', TotalDays: '', DaysLeft: '', HoursLeft: '', MinsLeft: '', SecondsLeft: '', TotalBuyers: '', InEscrow: '', requestTimeStamp: '' };
  }


  setVitalVariables(data: any) {
    if (!data) {
      return false;
    }

    this.vitals = data;
    this.sharePrice = +this.vitals.TokenSalesPrice;
    this.fees = +this.vitals.SalesCommission;

    if (this.vitals.DaysLeft) {
      const daysLeft = +this.vitals.DaysLeft;
      if (daysLeft < 0) { this.daysToGo = 0; return; }
      this.daysToGo = daysLeft;
      return;
    }

    return;

  }


  setProductImages() {
    this.productImages = [
      {
        src: 'assets/img/client-2/product/1.png',
        name: 'Product 1',
        description: 'Sweet lettuce'
      },
      {
        src: 'assets/img/client-2/product/2.png',
        name: 'Product 2',
        description: '3x Grow Speed'
      },
      {
        src: 'assets/img/client-2/product/3.png',
        name: 'Product 3',
        description: 'Floating raft'
      },
      {
        src: 'assets/img/client-2/product/4.png',
        name: 'Product 4',
        description: 'One week old'
      },
      {
        src: 'assets/img/client-2/product/5.png',
        name: 'Product 5',
        description: 'Scale farming'
      },
      {
        src: 'assets/img/client-2/product/6.png',
        name: 'Product 6',
        description: 'Quality produce'
      }
    ];
  }

  viewProductImage(id: number) {
    console.log(id);
    console.log(this.productImages);
    const options = {
      share: false,
      closeButton: true,
      piccasoOptions: {
        fit: true,
        centerInside: true,
        centerCrop: true
      }
    };

    return;

  }

  getSubtitle(type: string): string {
    if (type === 'time') {
      if (this.percentComplete >= 100) {
        return '';
      }
      return this.hoursToGo ? 'hours' : 'days';
    } else {
      if (this.percentComplete >= 100) {
        return 'SOLD OUT';
      } else if (this.percentComplete >= 50) {
        return 'Selling fast!';
      } else if (this.percentComplete > 0) {
        return 'Brand new';
      } else {
        return '';
      }
    }
  }

  showBalanceExceeded() {
    const message = 'Amount entered exceeds funds available';
    this.user.setToast(message);

  }

  showSetMax() {
    if (this.fiatObjects && this.fiatObjects.length > 0 && this.fiatObjects[0].Available
      && +this.fiatObjects[0].Available > 0
      && +this.fiatObjects[0].Available > this.sharePrice) {
      return true;
    }
    return false;
  }


  calcAmount(): any {
    if (!this.fiatObjects || this.fiatObjects.length === 0) {
      return;
    }

    if (this.sharesAmount < 0 && this.fiatAmount < 0) {
      return;
    }

    if (isNaN(this.fiatAmount)) { return; }

    if (this.fiatAmount === 0) { return; }

    this.transactionObj.totalValue = this.fiatAmount;
    this.transactionObj.totalShares = this.fiatAmount / this.sharePrice;
    this.sharesAmount = Math.floor(this.transactionObj.totalShares);

    if (this.fiatAmount > +this.fiatObjects[0].Available) {

      this.showBalanceExceeded();
    }
    return;
  }

  setFiatWalletBalance() {
    if (this.sharesToggle) { // shares input - calculate shares for available balance
      if (+this.fiatObjects[0].Available <= 0 || this.sharePrice <= 0) {
        this.sharesAmount = 0;
        return;
      }
      const numShares = +this.fiatObjects[0].Available / this.sharePrice;
      this.sharesAmount = Math.floor(numShares);

    } else {
      if (!this.fiatObjects[0].Available || +this.fiatObjects[0].Available <= 0) {
        this.fiatAmount = 0;
        return;
      }

      const numShares = +this.fiatObjects[0].Available / this.sharePrice;
      this.sharesAmount = Math.floor(numShares);

      this.fiatAmount = this.sharesAmount * this.sharePrice;

    }

  }

  close() {
    this.router.navigate(['home']);
  }

  prevStep() {
    if (this.buyStep === 1) {
      if (this.sessionToken) {
        this.router.navigate(['home']);
        return;
      }
      this.router.navigate(['auth']);
      return;
    }
    this.buyStep--;
    return;
  }


  toggleShareToggle(): void {
    this.calcAmount();
    this.sharesToggle = !this.sharesToggle;
  }

  setVehicle(value: string) {
    this.transactionObj.vehicle = 'spv';
  }

  doBuyProcess() {
    const numShares = 0;

    const params = {
      type: 'buy',
      legalid: this.legalId,
      amount: this.transactionObj.totalShares,
      vehicle: 'spv',
      termsaccepted: this.transactionObj.terms ? 1 : 0
    };

    this.user.doBuyShares(params).then(success => {
      this.showSpinner = false;

      this.primeObjects();
      setTimeout(() => {
        this.user.setPermaToast('Transaction complete! Shares added to your escrow wallet.');
        setTimeout(() => {
          this.router.navigate(['home']);
        }, 250);
      }, 500);

    }, failed => {
      this.showSpinner = false;
      this.showBuyPopup = true;
      this.buyStep = 3;
      setTimeout(() => {
        this.user.setPermaToast('Share purchase failed. If the problem continues please contact support for assistance.');
      }, 500);

    });
  }

  showHelp() {
    this.openModal();
  }

  launchDocs(id: number) {
    let url = "";
    switch (id) {
      case 0: {
        // IM URL
        url = "https://instavestcapital.com/clients/pureorganic/im";
        break;
      }
      case 1: {
        // IM URL
        url = "https://www.puregrow.co.za";
        break;
      }
      case 2: {
        // IM URL
        url = "https://instavestcapital.com/clients/iindustries/companydocs.pdf";
        break;
      }
      case 3: {
        // IM URL
        url = "http://instavestcapital.com/legal/azuzatos.pdf";
        break;
      }
    }

    this.launchExternalWebsite(url);
  }

  launchExternalWebsite(url: string) {
    if (url) {
      //  window.open(url, '_system', 'location=yes');
      this.browser.create(url, "_system");
    }
    return;
  }

  async openModal() {
    let helpScreen: any = null;
    let helpText = null;
    this.currentPage = 'project';
    console.log('currentPge', this.currentPage);

    this.helpStrings.getHtmlString(this.currentPage).then(async (text: string) => {
      helpText = await text;
      console.log('this is helpText: ' + helpText); // Help string return nog Null
      if (helpText == null) {
        helpText = '<h3>Under construction</h3><p class=\'text-white\'>No help content created for this page yet</p>';
      }

      helpScreen = await this.user.getInstructionsPage(helpText);
      await helpScreen.present();
    });

  }

}
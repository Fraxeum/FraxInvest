import { Component, ElementRef, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { IonFab, Platform } from '@ionic/angular';
import { SessionService } from 'src/app/providers/session/session.service';
import { UserService } from 'src/app/providers/user.service';

type TermsObj = { "terms1": boolean, "terms2": boolean, "terms3": boolean, "terms4": boolean, "terms5":boolean };
type OfferVitals = { "LegalId": string, "StartDate": string, 'EndDate': string, 'TokensIssued': string, 'TokensAvailable': string, 'TokenBasePrice': string, 'SalesCommission': string, 'TokenSalesPrice': string, 'TokensSold': string, 'TotalDays': string, 'DaysLeft': string, 'HoursLeft': string, 'MinsLeft': string, 'SecondsLeft': string, 'TotalBuyers': string, 'InEscrow': string, 'requestTimeStamp': string };
type FiatObject = { 'FundId': string, 'SPVNAME': string, 'Type': string, 'MemberId': string, 'Currency': string, 'Withdraw': string, 'Deposit': string, 'Spend': string, 'Income': string, 'Available': string, 'escrow_in': string, 'escrow_out': string, 'CurrencySymbol': string, 'CurrencySymbolPos': string, 'CurrencyName': string, 'LocalCurrency': string, 'LocalCurrencySymbol': string, 'LocalCurrencySymbolPos': string, 'Extra': string, 'RecStatus': string, 'locale_id': string, 'currency_code': string };
type checkoutObj = {
  'price': number,
  'totalShares': number,
  'totalValue': number,
  'fees': number, 
  'vehicle': string,
  'terms': TermsObj,
  'confirm': boolean
};


@Component({
  selector: 'app-shared-buy-wizard',
  templateUrl: './shared-buy-wizard.component.html',
  styleUrls: ['./shared-buy-wizard.component.scss']
})
export class SharedBuyWizardComponent {
  @ViewChild('fab') fab: IonFab;

  legalID: number;

  // buy-wizard
  showBuyPopup: boolean;
  sharesToggle: boolean;
  public buyStep: number;
  sharesAmount: number;
  public fiatAmount: number;
  maxBuySteps: number;
  assetName: string;
  sharesAvail: number;

  termsAllChecked = false;

  termsList: TermsObj;

  paymentStep = 1;
  public spendableBalance = 0;

  public checkoutData: checkoutObj;

  @Input('fiatdata') fiatdata: FiatObject;
  @Input('vitals') vitals: OfferVitals;
  @Input('step') step: number;
  @Input('sharePrice') sharePrice: number;
  @Input('fees') fees: number;

  @Output() checkoutMsg = new EventEmitter<string>();
  @ViewChild('shares') shares: ElementRef;
  @ViewChild('fiat') fiat: ElementRef;

  fiatObj: FiatObject;

  constructor(public user: UserService, public session: SessionService, platform: Platform) {

    this.primeVariables();
    this.maxBuySteps = 3; // 3 for primary market, 4 for secondary market (add step for offer-price)

  }

  async waitFiatData() {
    return await this.fiatdata;
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

  checkEnterPressed(event: any) {
    if (event.keyCode === 13 || event.charCode === 13 || event.code === "Enter") {
      this.nextStep(1);
      return;
    }
    return;
  }


  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (changes.fiatdata && changes.fiatdata.currentValue) {
      this.setWalletBalances(changes.fiatdata.currentValue);
    }

    if (changes.step && changes.step.currentValue !== changes.step.previousValue) {
      if (typeof changes.step.currentValue === 'number') {
        this.buyStep = changes.step.currentValue;
      }
    }
  }

  public formatNum(num: number): number {

    if (num && typeof num === 'string') {
      return parseInt(num);
    } else { return num; }
  }


  public setLegalID(id: number) {
    this.legalID = id;
  }

  public setSharePrice(price: number) {
    this.sharePrice = price;
  }

  public setMarketType(market: string) {
    if (market === 'S') {
      // add extra step to buy wizard
      this.buyStep = 0;
      this.maxBuySteps = 4;
    } else {
      this.maxBuySteps = 3; // default
      this.buyStep = 1;
    }
  }

  async primeVariables() {

    this.termsList = {
      terms1: false,
      terms2: false,
      terms3: false,
      terms4: false,
      terms5: false
    };

    this.termsAllChecked = false;

    this.checkoutData = {
      price: 0,
      totalShares: 0,
      totalValue: 0.00,
      fees: 0.00,
      vehicle: 'spv',
      terms: this.termsList,
      confirm: false
    };

    this.sharesAmount = 0;
    this.fiatAmount = 0;

    this.showBuyPopup = false;
    this.sharesToggle = true;
    this.buyStep = 1;
    this.assetName = '';

    this.sharePrice = 0;
    this.fees = 0;

    // await this.setFiatWalletBalance();

    // this.calcAmount();

  }

  // toggles between show/hide wizard
  public toggleBuyWizard(legalId: number, sharePrice: number, market: string, assetName: string) {

    this.assetName = assetName;

    this.setMarketType(market);

    legalId ? this.setLegalID(legalId) : false;

    sharePrice ? this.setSharePrice(sharePrice) : 0;

    this.showBuyPopup = legalId ? !this.showBuyPopup : this.showBuyPopup;

  }

  // might be duplicate of above <---- CHECK DELETE LATER IF SAME
  toggleBuyPopupVisibility(legalId?: number): void {
    console.log('toggle toggled');
    return;

    if (legalId) {
      this.setLegalID(legalId);
    }

    this.showBuyPopup = !this.showBuyPopup;

  }

  // calls getWalletBalances to set wallet balances
  async setWalletBalances(currentValue: FiatObject) {
    this.fiatObj = await currentValue;
    this.sharesAvail = this.toFloat(this.vitals.TokensAvailable);
    this.sharesAvail = Math.floor(this.sharesAvail); // ensuring that the decimals are removed
    this.spendableBalance = await ((this.toFloat(this.fiatObj.Available) / 101) * 100);
  }

  public calcAmount(): any {
    // ensuring non-negative values
    if (this.fiatAmount && this.fiatAmount < 0) {
      this.fiatAmount = Math.abs(this.fiatAmount);
    }

    if (this.sharesAmount) {
      this.sharesAmount = Math.abs(this.sharesAmount); // no negative shares
      this.sharesAmount = Math.ceil(this.sharesAmount); // no fractions of shares
    }


    if (this.sharesToggle) {

      if (isNaN(this.sharesAmount) || this.sharesAmount === 0) {
        this.fiatAmount = 0;
        this.checkoutData.totalShares = 0;
        this.checkoutData.totalValue = 0;
        this.checkoutMsg.emit(JSON.stringify(this.checkoutData));
        return;
      }

      // trying to buy more shares than is available
      if (this.sharesAmount > this.sharesAvail) {
        this.sharesAmount = this.sharesAvail;
        this.showAvailSharesExceeded();
      }

      this.checkoutData.totalShares = this.sharesAmount;
      this.checkoutData.totalValue = this.fiatAmount = this.sharesAmount * this.sharePrice;

      if (this.fiatAmount > 100000000) {
        this.showMaxExceeded();
        return;

      }

      if (this.fiatAmount > this.spendableBalance) {
        console.log(this.fiatAmount);
        console.log(this.spendableBalance);
        this.showBalanceExceeded();
        return;
      }

      try {
        this.checkoutData.totalValue = parseFloat(this.fiatAmount.toFixed(2));
        this.fiatAmount = this.checkoutData.totalValue;

      } catch (err) {
        this.checkoutData.totalValue = this.fiatAmount;
      }

      this.checkoutMsg.emit(JSON.stringify(this.checkoutData));

      // this.setFiatWalletBalance();

      return;

    } else {

      if (isNaN(this.fiatAmount) || this.fiatAmount === 0) {
        this.sharesAmount = 0;
        this.checkoutData.totalShares = 0;
        this.checkoutData.totalValue = 0;
        this.checkoutMsg.emit(JSON.stringify(this.checkoutData));
        return;
      }

      const shares = Math.floor(this.fiatAmount / this.sharePrice);

      // trying to buy more shares than is available
      if (shares > this.sharesAvail) {
        this.sharesAmount = this.sharesAvail;
        this.fiatAmount = shares * this.sharePrice;
        this.showAvailSharesExceeded();
      }

      this.checkoutData.totalValue = isNaN(this.fiatAmount) ? 0 : this.fiatAmount;

      this.checkoutData.totalShares = Math.floor(shares);

      this.checkoutData.totalValue = this.checkoutData.totalShares * this.sharePrice;

      if (this.checkoutData.totalShares <= 0) {
        this.checkoutMsg.emit(JSON.stringify(this.checkoutData));
        return;
      }

      if (this.checkoutData.totalValue > 1000000) {
        this.showMaxExceeded();
        return;

      }

      if (this.checkoutData.totalValue > this.spendableBalance) {
        this.showBalanceExceeded();
        return;
      }

      this.checkoutMsg.emit(JSON.stringify(this.checkoutData));
      return;

      // this.setFiatWalletBalance();

    }

    return;
  }

  showMaxExceeded() {
    const message = 'The maximum single investment one can make is one million Rand';
    this.user.setToast(message, true);
  }

  showBalanceExceeded() {
    const message = 'You need to deposit more money to buy that number shares.';
    this.user.setToast(message, true);
  }

  showAvailSharesExceeded() {
    const message = "You cannot buy more shares than is available.";
    this.user.setToast(message, true);
  }

  acceptTerms(item: number) {
    switch (item) {
      case 1: {
        this.termsList.terms1 = !this.termsList.terms1;
        this.checktermsList();
        break;
      }
      case 2: {
        this.termsList.terms2 = !this.termsList.terms2;
        this.checktermsList();
        break;
      }
      case 3: {
        this.termsList.terms3 = !this.termsList.terms3;
        this.checktermsList();
        break;
      }
      case 4: {
        this.termsList.terms4 = !this.termsList.terms4;
        this.checktermsList();
        break;
      }
      case 5: {
        this.termsList.terms5 = !this.termsList.terms5;
        this.checktermsList();
        break;
      }


    }

  }

  allTermsChecked(): Promise<boolean> {
    console.log('Checking if all terms have been accepted');

    return new Promise((resolve, reject) => {

      for (const item in this.termsList) {
        if (!this.termsList[item]) {
          resolve(false);
          break;
        }
      }

      resolve(true);

    });

  }

  checktermsList(): boolean {
    let checked = false;
    this.allTermsChecked().then((result) => {
      this.termsAllChecked = checked = result;
      if (result) {
        this.checkoutData.confirm = result;
        this.checkoutData.terms = this.termsList;
        console.log(this.checkoutData);
        this.checkoutMsg.emit(JSON.stringify(this.checkoutData));
      }
    });
    return checked;
  }



  nextStep(dir: number) {

    if (this.buyStep === 1 && this.checkoutData.totalShares < 1) {
      this.user.setToast('Your investment amount is too low. You must buy at least one share.');
      return;
    }

    if (dir > 0) {
      if (this.buyStep + 1 > 3) {
        // this.sendTransaction(); return;

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

  prevStep() {
    if (this.fab) {
      this.fab.close();
    }

    if (this.buyStep === 1) {
      // this.navCtrl.pop();

    } else {
      this.buyStep--;
    }
    return;
  }


  toggleShareToggle(): void {
    this.calcAmount();
    this.sharesToggle = !this.sharesToggle;
  }


    setVehicle(value: string) {
      this.checkoutData.vehicle = 'spv';
    }


    setFiatWalletBalance() {
      this.sharePrice = typeof (this.sharePrice) === 'undefined' ? 0 : this.sharePrice;

      if (this.sharesToggle) { // shares input - calculate shares for available balance
        if (this.spendableBalance <= 0 || this.sharePrice <= 0) {
          this.sharesAmount = 0;
          return;
        }
        console.log("HERE: " + this.checkoutData.totalShares);
        const numShares = (this.spendableBalance / this.sharePrice);
        this.checkoutData.totalShares = this.sharesAmount = Math.floor(numShares);

      } else {

        if (this.spendableBalance <= 0) {
          this.fiatAmount = 0;
          return;
        }
        console.log("OR HERE: " + this.checkoutData.totalShares);
        const numShares = this.spendableBalance / this.sharePrice;
        this.sharesAmount = Math.floor(numShares);

        this.checkoutData.totalValue = this.fiatAmount = (this.sharesAmount * this.sharePrice);

      }

      this.checkoutMsg.emit(JSON.stringify(this.checkoutData));

    }

  }

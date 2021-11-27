import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { NavParams, IonFab } from '@ionic/angular';
import { UserService } from '../providers/user.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { HtmlHelpStringsService } from '../providers/html-help-strings.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { loadStripe } from '@stripe/stripe-js';

type EFTDepositObject = { 'BankAccountName': string, 'BankAccountNumber': string, 'BankAccountType': string, 'BankBranchCode': string, 'BankName': string, 'BankStreetAddress': string, 'BankSwiftCode': string };
type CardDepositObject = { 'success': boolean, 'code': number, 'message': string, 'data': { 'iApiTransactionId': string } };
type CryptoObject = Array<{ 'name': string, 'symbol': string }>;

type DepositDetails = { 'reference': string, 'currency': string, 'CountryId': string, 'amount': any, 'fundId': string };

// type EFTResponse = { 'reference': string, 'amount': string, 'fundId': string };
type EFTResponse = { "bankaccountname": string, "bankname": string, "bankstreetaddress": string, "bankaccounttype": string, "bankaccountnumber": string, "bankswiftcode": string, "bankbranchcode": string };

type CardResponse = { 'iApiTransactionId': string, 'amount': string, 'fundId': string, 'reference': string };
type CryptoResponse = { 'error': string, 'result': { 'amount': string, 'txn_id': string, 'address': string, 'confirms_needed': string, 'timeout': number, 'checkout_url': string, 'status_url': string, 'qrcode_url': '' }, 'amount': string, 'fundId': string, 'reference': string, 'fees': string };


type DepositOptions = { 'EFT'?: EFTDepositObject, 'Crypto'?: CryptoObject, 'CreditCard'?: CardDepositObject, 'reference': string, 'currency': string, 'CountryId': string, 'amount': string, 'fundId': string };
type DepositObject = { 'paymentMethod': string, 'depositDetails': { 'amount': number, 'currency': string, 'base': string } };

type ExchangeRateData = Array<{ 'is_fiat': number, 'rate_btc': string, 'last_update': string, 'tx_fee': string, 'status': string, 'name': string, 'confirms': string, 'can_convert': number, 'capabilities': string[], 'explorer': string, 'accepted': number, 'symbol': string, 'imageUri'?: string }>;
type Currency = { 'is_fiat': number, 'rate_btc': string, 'last_update': string, 'tx_fee': string, 'status': string, 'name': string, 'confirms': string, 'can_convert': number, 'capabilities': string[], 'explorer': string, 'accepted': number, 'symbol': string, 'imageUri'?: string, 'selected'?: boolean, 'rate_usd'?: string };
type SupportedCurrencies = Array<{ 'name': string, data: Currency }>;

type CardPaymentObject = { type: string, amount: number /* cents */, currency: string };

declare var Stripe;

@Component({
  selector: 'app-deposit-money',
  templateUrl: './deposit-money.page.html',
  styleUrls: ['./deposit-money.page.scss'],
  providers: [NavParams]
})
export class DepositMoneyPage implements OnInit {

  /* Working Vars */
  payingByCard = false;
  currentPage = 'setup';
  firstLoad = true;
  public depositDetails: DepositDetails;
  depositOptions: DepositOptions;
  public depositObject: DepositObject;
  cryptoOptions: CryptoObject;

  eftResponse: EFTResponse = null;
  cardResponse: CardResponse = null;
  public cryptoResponse: CryptoResponse = null;

  paymentMethods: Array<string> = ['eft', 'card', 'Crypto'];
  public cryptoIcons = [{ name: 'Frax Coin' }, { name: 'Bitcoin' }, { name: 'Bitcoin SV' }, { name: 'Bitcoin Cash' }, { name: 'Ethereum' }, { name: 'Neo' }, { name: 'Monero' }, { name: 'Litecoin' }, { name: 'Ethereum Classic' }];

  supportedCurrencies: Currency[];
  selectedIndex = 0;

  test = '1';
  public selectedCryptoIndex = 0;
  depositPageHeader = '';
  clipboard: Clipboard;

  loadCardPayment = false;

  showCurrencyList = false;
  ZARUSDRate = 0;
  ZARBTCRate = 0;

  // stripeKey = 'pk_live_51IqvKMHYWWosiZYWht27XMG5PIrxRptrMO8qxdotkxfjG5OdSBz3w9ufCbX9XSTVTCoegHbRcWpQvXtwn9Rdgwy500GrdmJEOJ';
  stripeKey = 'pk_test_51IqvKMHYWWosiZYWAkTVzjV27kzKAJjSQzeI1yYLGoKK4kmXgrFqn5SjuhtSemFg5LpVeZSCOfzoy3YtQPhn8NNn00hJprqu7d';
  initStripe = false;

  constructor(
    public user: UserService,
    public navParams: NavParams,
    clipboard: Clipboard,
    public router: Router,
    public helpStrings: HtmlHelpStringsService,
    public browser: InAppBrowser,
    //public storage: Storage
  ) {
    this.clipboard = clipboard;
    this.primeDepositOptionsData();

  }


  ngOnInit() {
  }

  getBackgroundColor(idx: number) {
    return (idx % 2 !== 0) ? { background: "rgba(255,255,255,0.05)" } : { background: "transparent" };
  }

  getUSDRate(): number {
    const rate = this.toFloat(this.supportedCurrencies[0].rate_usd);

    if (typeof rate === "number" && rate !== 0) {
      return 1 / rate;
    }

    return 0;
  }


  getXRate(): number {
    const rate = this.toFloat(this.supportedCurrencies[0].rate_btc);

    if (typeof rate === "number" && rate !== 0) {
      return 1 / rate;
    }
    return 0;
  }

  // if fees are returned as anything but a string then 0 will be returned
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

  copyToClipboard(fieldname: string, str: string) {
    console.log('copied: ' + str);
    this.clipboard.copy(str);
    this.user.setToast(fieldname + ' copied to device clipboard');
    return;
  }

  getIconPath(iconName: string) {
    return '/assets/icon' + iconName + '.png';
  }

  async launchCardPayment() {
    this.payingByCard = !this.payingByCard;

    const amount = (+this.depositDetails.amount) * 103; /* Add 3% to Rand amount and x100 to convert to cents */

    const cardPaymentObj: CardPaymentObject = {
      type: 'CreditCard',
      amount,
      currency: 'ZAR'
    };

    console.log(cardPaymentObj);

    this.setupStripe(cardPaymentObj);


  }

  changeCurrency(symbol: string, index: number) {
    if (!symbol) { return; }

    if (symbol === 'ZAR') {
      this.depositObject.paymentMethod = this.paymentMethods[0];
    } else {
      this.depositObject.paymentMethod = this.paymentMethods[2];
    }

    this.depositObject.depositDetails.currency = symbol;
    this.depositObject.depositDetails.base = symbol;

    this.supportedCurrencies[this.selectedIndex].selected = false;
    this.supportedCurrencies[index].selected = true;
    this.selectedIndex = index;

    this.toggleSwitchCurrency();

    this.user.setShortToast("Deposit currency set to " + this.supportedCurrencies[this.selectedIndex].name);

    return;
  }

  toggleSwitchCurrency() {
    this.showCurrencyList = !this.showCurrencyList;

    return;
  }

  async primeDepositOptionsData() {
    this.depositDetails = null; // { reference: '', currency: '', CountryId: '', amount: '', fundId: '' };
    this.depositOptions = null; // { EFT: { BankAccountName: '', BankAccountNumber: '', BankAccountType: '', BankBranchCode: '', BankName: '', BankStreetAddress: '', BankSwiftCode: '' }, Crypto: [{ name: '', symbol: '' }], CreditCard: { success: true, code: 0, message: '', data: { iApiTransactionId: '' } }, reference: '', currency: '', CountryId: '', amount: '', fundId: '' };
    this.depositObject = { paymentMethod: this.paymentMethods[0], depositDetails: { amount: null, currency: 'ZAR', base: 'ZAR' } };
    this.cryptoOptions = [{ name: '', symbol: '' }];
    this.supportedCurrencies = [];
    await this.getExchangeRates();
  }

  // Used to get email address for credit card payment
  async getUserEmail(): Promise<string> {
    let token: any = null;
    return new Promise((resolve, reject) => {

      Storage.get({ key: "session_token" }).then(async (result) => {
        token = result;
        await this.user.getUserInfo(token).then(
          async (response: any) => {
            if (await response.data.general.Email) {
              console.log("response.data.general.Email:");
              console.log(response.data.general.Email);
              resolve(response.data.general.Email);
              return;
            }
            console.log("response.data.general.Email: Response returned ");
            console.log(response);
            resolve("");
            return;
          }, err => {
            console.log("response.data.general.Email: null");
            resolve(null);
            return;
          });
      });
    });

  }

  // Build an array of supported Cryptos with their exchange rates
  getExchangeRates(): Promise<any> {
    return new Promise((resolve, reject) => {
      const rates = this.user.getSupportedCurrenciesAndRates().then((result) => {
        if (result && result.data) {

          const items = Object.keys(result.data);
          const index = 0;

          // setting local fiat currency in first position
          result.data.ZAR.imageUri = 'assets/icon/ZAR.png';
          this.supportedCurrencies.push(result.data.ZAR);
          this.supportedCurrencies[0].selected = true;
          this.depositObject.depositDetails.currency = 'ZAR';
          this.depositObject.depositDetails.base = 'ZAR';
          this.depositObject.paymentMethod = this.paymentMethods[0];

          items.forEach(element => {

            if (element !== 'ZAR' && element !== 'USD') {
              result.data[element].imageUri = 'assets/icon/' + result.data[element].symbol + '.png';
              this.supportedCurrencies.push(result.data[element]);
            }

          });

          this.ZARUSDRate = this.getUSDRate();
          this.ZARBTCRate = this.getXRate();

          return result.data;
        } else { return null; }
      }, () => {
        return false;
      });
    });
  }

  goHome() {
    this.router.navigate(['home']);
  }

  formatAddress(address: string): string {
    console.log("Inspecting this: " + address);
    if (!address) { return; }
    const str = 'bitcoincash:';
    const pos = address.indexOf(str);
    console.log('Found ' + str + ' here: ' + pos);
    if (pos !== 0) { return address; }

    return address.substr(str.length, address.length - 1);
  }

  getPaymentMethodType() {
    switch (this.depositObject.paymentMethod) {
      case 'card': return this.paymentMethods[1];
      case 'Crypto': return this.paymentMethods[2];
      default: return this.paymentMethods[0];
    }
  }

  emailDetails() {
    this.user.setToast('The deposit details have been emailed to you!');
  }

  launchExternalWebsite(url: string) {

    if (url) {
      const browser = this.browser.create(url, "_system");
    }

    return;
  }

  getEstBTCValue() {
    return (this.depositObject.depositDetails.amount * (1 / (+this.supportedCurrencies[0].rate_btc))) * 0.99;
  }

  getEstAltValue() {
    return this.depositObject.depositDetails.amount * (+this.supportedCurrencies[this.selectedIndex].rate_btc * (1 / (+this.supportedCurrencies[0].rate_btc))) * 0.99;
  }

  getStripeToken(creditCardObj: CardPaymentObject): Promise<any> {
    this.initStripe = true;

    return new Promise((resolve, reject) => {

      this.user.loadBankingOptions(creditCardObj.amount, creditCardObj.currency, creditCardObj.currency, creditCardObj.type).then(async (response) => {

        const data = await response;

        console.log(data.data);

        if (!data.data || !data.data.stripe) {
          resolve(null);
          return;
        }

        this.initStripe = false;

        resolve(data.data.stripe);
        return;
      });
    });
  }



  loadBankingData(): Promise<any> {
    const amount: number = this.depositObject.depositDetails.amount;
    const currency = this.depositObject.depositDetails.base;
    const denomination = this.depositObject.depositDetails.currency;
    const type = this.depositObject.paymentMethod;

    if (this.firstLoad) {
      this.currentPage = "connecting";
    }

    return new Promise((resolve, reject) => {

      this.user.loadBankingOptions(amount, currency, denomination, type).then(async (response) => {

        if (!response.success || !response.data) {
          this.user.exitToLoginPage();
          return false;
        }

        const data = response.data;

        if (this.depositObject.paymentMethod === 'Crypto') {

          if (data.result && data.result.checkout_url && data.result.checkout_url.length > 1) {
            console.log('SUCCESS');
            console.log(data);
            try {
              // show crypto payment page
              this.currentPage = 'CryptoFinal';
              this.cryptoResponse = data as CryptoResponse;
              this.depositPageHeader = 'Deposit Summary';
            } catch (error) {
              console.log('Launch website error: ' + error.message);
            }
          } else {
            // handle crypto data load error here
          }

          return;
        }

        if (data.EFT && this.depositObject.paymentMethod === this.paymentMethods[0]) {
          this.depositDetails = { reference: data.reference, currency: data.currency, CountryId: '', amount: data.amount, fundId: '' };
          this.eftResponse = (data.EFT as EFTResponse);
          this.currentPage = 'EFT_Final';
          this.depositPageHeader = 'Deposit Summary';
          return;
        }
      });
    });

  }

  // returns an address that has been modified for visual purposes
  getSafeAddress(address: string): string {
    if (!address || address.length < 20) {
      return address ? address : "";
    }

    if (address.length > 20) {
      address = this.formatAddress(address); // remove "bitcoincash:" prefix
      if (address.length > 20) { // shorten address
        address = address.substr(0, 6) + "..." + address.substr(address.length - 7, 6);
      }
    }

    return address;
  }

  goBack() {
    this.currentPage = 'setup';
    this.primeDepositOptionsData();
  }

  nextStep() {
    this.loadBankingData();
    return;
  }

  showHelp() {
    this.openModal();
  }

  async openModal() {
    let helpScreen: any = null;
    let helpText = null;
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

  // Stripe integration - accepts paymentIntent as var from getStripeToken()

  async setupStripe(paymentData: CardPaymentObject) {

    // A reference to Stripe.js initialized with your real test publishable API key.
    const stripeObj = await Stripe(this.stripeKey);

    // The items the customer wants to buy
    const purchase = {
      items: [{ id: "prod_JVVpXMsm2SDTxI" }] // Azuza Product - ZAR Coins
    };

    // Disable the button until we have Stripe set up on the page
    document.querySelector("button").disabled = true;

    /*
        fetch("/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(purchase)
        })
          .then((result) => {
            return result.json();
          })*/
    await this.getStripeToken(paymentData) /* returns payment intent or null */
      .then((paymentIntent) => {
        const elements = stripeObj.elements();
        const style = {
          base: {
            color: "#32325d",
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
              color: "#32325d"
            }
          },
          invalid: {
            fontFamily: 'Arial, sans-serif',
            color: "#fa755a",
            iconColor: "#fa755a"
          }
        };

        const card = elements.create("card", { style });

        // Stripe injects an iframe into the DOM
        card.mount("#card-element");

        card.on("change", (event) => {
          // Disable the Pay button if there are no card details in the Element
          document.querySelector("button").disabled = event.empty;
          document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
        });

        const form = document.getElementById("payment-form");

        form.addEventListener("submit", (event) => {
          event.preventDefault();
          // Complete payment when the submit button is clicked
          console.log("Using client secret: ")
          console.log(paymentIntent.client_secret);
          payWithCard(stripeObj, card, paymentIntent.client_secret);
        });
      });

    // Calls stripeObj.confirmCardPayment
    // If the card requires authentication Stripe shows a pop-up modal to
    // prompt the user to enter authentication details without leaving your page.
    const payWithCard = (stripe, card, clientSecret) => {
      loading(true);
      stripeObj.confirmCardPayment(clientSecret, {
        payment_method: {
          card
        }
      })
        .then((result) => {
          if (result.error) {
            // Show error to your customer
            showError(result.error.message);
          } else {
            // The payment succeeded!
            orderComplete(result.paymentIntent.id);
          }
        });
    };
    /* ------- UI helpers ------- */
    // Shows a success message when the payment is complete
    const orderComplete = (paymentIntentId) => {
      loading(false);
      document
        .querySelector(".result-message")
        .setAttribute(
          "href",
          "https://dashboard.stripe.com/test/payments/" + paymentIntentId
        );
      document.querySelector(".result-message").classList.remove("hidden");
      document.querySelector("button").disabled = true;
      setTimeout(() => {
        this.router.navigate(['home']);
      }, 5000);
    };
    // Show the customer the error from Stripe if their card fails to charge
    const showError = (errorMsgText) => {
      loading(false);
      const errorMsg = document.querySelector("#card-error");
      errorMsg.textContent = errorMsgText;
      setTimeout(() => {
        errorMsg.textContent = "";
      }, 4000);
    };

    // Show a spinner on payment submission
    const loading = (isLoading) => {
      if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
      } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
      }
    };
  }
}


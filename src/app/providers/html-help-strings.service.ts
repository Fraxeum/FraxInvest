import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlHelpStringsService {

   htmlHelpStrings: Array<{ "identifier": string, "htmlString": string }>;

  constructor() {
    this.setStrings();
  }


   setStrings() {
    this.htmlHelpStrings = [{
      "identifier": "login",
      "htmlString": '<h2>The log in page</h2><p class="text-white">Log into your Azuza account by providing the email address you registered with or your username, if you created one, and your password. Remeber passwords are case sensitive.</p>' +
        '<p><h3>Forgot password?</h3>Click on the "Forgot" button to reset your password using your account recovery key.</p>' +
        '<p><h3>Need help?</h3><p>Email Azuza: support@azuzawealth.com</p>'
    },
    {
      "identifier": "register",
      "htmlString": '<h2>The register page</h2><p class="text-white">All you need to create an Azuza account is a valid email address, which you will need to verify, a strong password and an account recovery key. </p>' +
        '<p><h3>What about KYC?</h3>You will need to complete the Azuza KYC process before you can deposit funds, buy and sell shares.</p>' +
        '<p><h3>Information security</h3><p>Your personal details are encrypted and stored in South Africa, on a secure database and is used only to communicate with you.</p>'
    },
    {
      "identifier": "lost-password",
      "htmlString": '<h2>Reset your password</h2><p class="text-white">Reset your password by entering the account recovery key you created when you signup with Azuza.</p>' +
        '<p><h3>Account recovery key hint:</h3>You selected nine to twelve words that are both CaSe sensitive and order sensitive.</p>' +
        '<p><h3>Lost recovery key?</h3><p>Email Azuza: support@azuzawealth.com Our support team will verify your identity manually, but it is important to understand that you will not be able to transact for up to 48-hours after your account has been unlocked.</p>'
    },
    {
      "identifier": "keywords",
      "htmlString": '<h2>Set up account recovery</h2><p class="text-white">If you ever lose your password or get locked out of your account you will be able to securely reset your password with your account recovery key.</p>' +
        '<p><h3>Your account recovery key:</h3>Your account recovery key is made up of nine to twelve words of your choice. They can be any words, example: one oil BIG stars clutch random winning OTC love</p>' +
        '<p><h3>Notes:</h3><ul><li>Words are case sensitive</li><li>The order of the words is important</li></ul>' +
        '<p><h3>Store your key safely:</h3><p class="text-white">Remember to write down your account recovery key - and store it in a safe place. Without your account recovery key you will need to manually verify your identity with the help of the Azuza support team.</p>'
    },
    {
      "identifier": "setup",
      "htmlString": '<h2>Topping up your Azuza Wallet</h2>' +
        '<p><h3>The basics</h3><p class="text-white">Azuza uses a crypto asset called ZAR-token ("ZART") to represent South African Rand. The value of one ZART equals one South African Rand.</p><p>You automatically buy ZART when you deposit funds into your Azuza Wallet.</p><p>Your wallet balance shows the Rand value of your ZART.</p>' +
        '<p><h3>What can you do with ZART?</h3><ul><li class="text-white">ZART can be used to buy shares.</li><li class="text-white">ZART can be sold and the cash be withdrawn to your bank account.</li></ul></p>' + 
        '<p><h3>What you cannot do with ZART</h3><ul><li class="text-white">ZART cannot be sent/transferred to other people</li><li class="text-white">ZART doesn’t earn interest</li></ul></p>' +
        '<p><h3>Topping up via EFT:</h3><p class="text-white">The first way to top up your wallet is via electronic transfer - that’s a payment from Internet banking to our bank account. Enter your top up amount and press next for EFT banking details</p>' +
        '<p><h3>Topping up via Crypto:</h3><p class="text-white">Azuza supports paying with a number of Cryptocurrencies. Paying with a Cryptocurrency incurs an exchange fee as well as a transaction processing fee - sometimes called “gas”. Enter an amount in Rand or Crypto that you want to pay and click next to see how it works.</p>'
    },
    {
      "identifier": "EFT_Final",
      "htmlString": '<h2>EFT Process</h2>' +
        '<p><p class="text-white">An online deposit from your bank account to ours could take up to 3 days to reflect on our side. We will detect your deposit automatically, when it clears and credit your Azuza Account.</p>' +
        '<h2>Deposit fees</h2><p>Deposits are FREE! We don\'t charge anything.</p>' +
        '<h2>Mistakes happen</h2><p>Please take care when you create a new beneficiary on your Internet banking profile. Double check our banking details and make sure you use the correct reference number. Always send us a proof of payment to "deposit@azuzawealth.com". It could go a long way in tracing misplaced funds.</p>'
    },
    {
      "identifier": "marketlist",
      "htmlString": '<h2>Selling your shares</h2>' +
        '<p><h3>The basics</h3><p class="text-white">Azuza offers you the opportunity to sell your shares to other Azuza users. To sell shares you simply click on “Sell shares” then add the number of shares you want to sell and the price that you want per share. Once saved, your anonymous sell offer will be visible in the Marketplace.</p>' +
        '<p><h3>Managing trades</h3><p class="text-white">Others have the opportunity to make you an offer for all of or a part of the shares you want to sell. When you receive an offer you can accept, reject or counter the offer. An offer that is accepted is immediately closed, meaning the funds are moved to your account and the shares are moved to the sellers account.</p>' +
        '<p><h3>Trading fees</h3><p class="text-white">Seller fees are 0.1% per transaction. Buyers don’t pay anything.</p>'
    },
    {
      "identifier": "market",
      "htmlString": '<h2>Tips on your first trade</h2>' +
        '<p><h3>The basics</h3>'
    },
    {
      "identifier": "project",
      "htmlString": '<h2>Getting involved in a startup</h2>' +
        '<p><h3>The basics</h3><p class="text-white">Azuza features startups that offer sustainable, impact or clean technology products and services. These startups are offering shares for sale to raise capital for growth. The startups featured on Azuza are handpicked by our professional team. Each company is already in business, their product has gone to market, they have customers and are on a high growth path. </p>' +
        '<p><h3>How it works</h3><p class="text-white">A dedicated, special type of company called a “special purpose vehicle or SPV” holds a startup’s shares. The SPV is managed by Azuza’s team of qualified CA’s and business professionals. This team represents the investors’ interest on the startup’s board. They make sure that your money is well spent and that the startup is well run.</p><p class="text-white">You are buying shares in the SPV. The SPV is authorised to hold shares in only one startup. So, whatever the shares earn is channeled directly to the SPV. As the value of the SPV grows or declines your share value follows suit.</p><p class="text-white">When you invest, your money is reserved in your escrow account. Your shares are reserved in the startup’s escrow account. If the startup succeeds in reaching their funding target, your shares get released to your wallet. If they don’t reach their target in the allotted time then you get all your money back.</p>' +
        '<p><h3>Shareholder rights</h3><p class="text-white">SPV shareholders don’t have voting rights. Shareholders agree to leave the running of the SPV to Azuza. Shareholders own the full economic benefit of the proceeds of the SPV. So, when the SPV declares dividends the shareholders get paid their dividends into their Azuza wallet.</p>' +
        '<p><h3>Risk</h3><p class="text-white">Investing in startups is risky business but it can also be a very rewarding experience. The Azuza team brings with them a host of expertise, contacts, and opportunities that will boost our startup’s chances of success. Alas success is not guaranteed. Our advice is that you do your research and don’t invest more than you can afford to lose.</p>'
    },
    {
      "identifier": "home",
      "htmlString": '<h2>Getting started with Azuza</h2>' +
        '<p><h3>Menu</h3><p class="text-white">Tap on the <ion-icon name="ellipsis-vertical-outline"></ion-icon> in the top left corner of the screen to open the Azuza main menu.</p>' +
        '<p><h3>My Money</h3><p class="text-white">When you start off with Azuza your wallet will show a zero balance. Add some money to your wallet by clicking on the <ion-icon name="ellipsis-vertical-outline"></ion-icon> to the right of the “My Money” section and then selecting “Deposit”.</p>' +
        '<p><h3>My Shares</h3><p class="text-white">Azuza makes owning shares in the latest green, sustainable, impact driven startups easy. Shares you’ve bought will be shown in the “My Shares” section. Tapping on this section changes the view helping you to keep an eye on your portfolio.</p>' +
        '<p><h3>Current Projects</h3><p class="text-white">This section hosts our “Current Projects” showcase. These are the businesses that we are currently open for investment. Tap on the business type that you are passionate about. A host of resources are at your disposal to make an informed decision.</p><small class="text-white">Remember, Azuza doesn’t offer advice. We bring all the information together and make it super easy for you to make an informed investment decision. Investment in startups is risky business, often referred to as high risk, high return investments. If you are unsure about an investment opportunity, please consult a professional investment advisor.</small>' +
        '<p><h3>Coming Projects</h3><p class="text-white">In this section we showcase potential future projects. Vote for your favourite projects. Projects that show the most support will have the chance to raise capital on Azuza.</p>'
    },
    {
      "identifier": "wallet",
      "htmlString": ''
    }];
  }

  public getHtmlString(identifier: string): Promise<any> {
    let text = null;
    for (let i = 0; i < this.htmlHelpStrings.length; i++) {
      if (this.htmlHelpStrings[i].identifier === identifier) {
        text = this.htmlHelpStrings[i].htmlString;
        i = this.htmlHelpStrings.length;
      }
    }

    return new Promise((resolve, reject) => {
      if (text == null) {
        reject(null);
      } else resolve(text);
    });

  }
}

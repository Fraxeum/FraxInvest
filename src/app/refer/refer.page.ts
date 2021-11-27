import { Component, OnInit } from '@angular/core';

import { NavigationExtras, Router } from '@angular/router';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-refer',
  templateUrl: './refer.page.html',
  styleUrls: ['./refer.page.scss'],
})
export class ReferPage implements OnInit {

  referralCode: any = null;

  constructor(//public storage: Storage,
    public router: Router) { }

  ngOnInit() {
    Storage.get({ key: 'refCode' }).then(async (code) => {
      this.referralCode = await code;
    }, err => {
      this.referralCode = "--";
    });
  }
}

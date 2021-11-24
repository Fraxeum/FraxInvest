import { Component, OnInit } from '@angular/core';

import { NavigationExtras, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-refer',
  templateUrl: './refer.page.html',
  styleUrls: ['./refer.page.scss'],
})
export class ReferPage implements OnInit {

  referralCode: string = null;

  constructor(public storage: NativeStorage, public router: Router) { }

  ngOnInit() {
    this.storage.getItem('refCode').then(async (code) => {
      this.referralCode = await code;
    }, err => {
      this.referralCode = "--";
    });
  }
}

import { Component, OnInit } from '@angular/core';

import { NavigationExtras, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-refer',
  templateUrl: './refer.page.html',
  styleUrls: ['./refer.page.scss'],
})
export class ReferPage implements OnInit {

  referralCode: string = null;

  constructor(public storage: Storage
    , public router: Router) { }

  ngOnInit() {
    this.storage.get('refCode').then(async (code) => {
      this.referralCode = await code;
    }, err => {
      this.referralCode = "--";
    });
  }
}

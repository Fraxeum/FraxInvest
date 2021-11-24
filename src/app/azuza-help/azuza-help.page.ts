import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-azuza-help',
  templateUrl: './azuza-help.page.html',
  styleUrls: ['./azuza-help.page.scss'],
})
export class AzuzaHelpPage implements OnInit {
  htmlData;
  @Input("htmlData") value;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    console.log('htmlData', this.htmlData);
  }



  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}

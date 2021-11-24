import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AzuzaHelpPageRoutingModule } from './azuza-help-routing.module';

import { AzuzaHelpPage } from './azuza-help.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AzuzaHelpPageRoutingModule
  ],
  declarations: [AzuzaHelpPage]
})
export class AzuzaHelpPageModule {}

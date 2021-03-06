import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketPageRoutingModule } from './market-routing.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { MarketPage } from './market.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Ng2SearchPipeModule,
    MarketPageRoutingModule
  ],
  declarations: [MarketPage]
})
export class MarketPageModule {}

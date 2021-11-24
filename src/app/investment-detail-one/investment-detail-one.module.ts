import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { InvestmentDetailOnePageRoutingModule } from './investment-detail-one-routing.module';
import { InvestmentDetailOnePage } from './investment-detail-one.page';
import { ComponentsModule } from 'src/components/components.module';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { ProgressBarModule } from 'angular-progress-bar';
import { PhotoViewer } from '@ionic-native/photo-viewer';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    InvestmentDetailOnePageRoutingModule,
    ProgressBarModule,
    ComponentsModule,
    NgxIonicImageViewerModule,
  ],
  declarations: [
    InvestmentDetailOnePage,
  ],
  providers: [
    PhotoViewer
  ]
})
export class InvestmentDetailOnePageModule { }

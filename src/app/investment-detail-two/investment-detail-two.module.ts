import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { InvestmentDetailTwoPageRoutingModule } from './investment-detail-two-routing.module';
import { InvestmentDetailTwoPage } from './investment-detail-two.page';
import { ComponentsModule } from 'src/components/components.module';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { ProgressBarModule } from 'angular-progress-bar';
import { PhotoViewer } from '@ionic-native/photo-viewer';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    InvestmentDetailTwoPageRoutingModule,
    ProgressBarModule,
    ComponentsModule,
    NgxIonicImageViewerModule
  ],
  declarations: [
    InvestmentDetailTwoPage,
  ],
  providers: [
    PhotoViewer
  ]
})
export class InvestmentDetailTwoPageModule { }

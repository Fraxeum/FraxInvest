import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvestmentDetailTwoPage } from './investment-detail-two.page';

const routes: Routes = [
  {
    path: '',
    component: InvestmentDetailTwoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvestmentDetailTwoPageRoutingModule {}

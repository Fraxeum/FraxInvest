import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AzuzaHelpPage } from './azuza-help.page';

const routes: Routes = [
  {
    path: '',
    component: AzuzaHelpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AzuzaHelpPageRoutingModule {}

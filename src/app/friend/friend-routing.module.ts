import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FriendPage } from './friend.page';

const routes: Routes = [
  {
    path: '',
    component: FriendPage
  },
  {
    path: 'add',
    loadChildren: () => import('./add/add.module').then( m => m.AddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FriendPageRoutingModule {}

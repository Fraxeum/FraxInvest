import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { Camera } from '@ionic-native/camera/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NativeStorage,
    Camera,
    Clipboard,
    SocialSharing,
    PhotoViewer,
    SplashScreen,
    Deeplinks,
    OneSignal
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { isProduction } from './environment';
import { AppModule } from './app.module';

if (isProduction()) {
    enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule);

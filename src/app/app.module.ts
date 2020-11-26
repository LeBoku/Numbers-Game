import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { StatsPaneComponent } from './stats-pane/stats-pane.component';
import { RulesComponent } from './rules/rules.component';
import { TruncatedNumberPipe } from './truncated-number.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
	declarations: [
		AppComponent,
		StatsPaneComponent,
		RulesComponent,
		TruncatedNumberPipe
	],
	imports: [
		BrowserModule,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

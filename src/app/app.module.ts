import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { StatsPaneComponent } from './stats-pane/stats-pane.component';
import { RulesComponent } from './rules/rules.component';
import { TruncatedNumberPipe } from './truncated-number.pipe';


@NgModule({
	declarations: [
		AppComponent,
		StatsPaneComponent,
		RulesComponent,
		TruncatedNumberPipe
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

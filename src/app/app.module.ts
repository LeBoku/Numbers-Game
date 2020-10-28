import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NumberOfPipe } from './number-of.pipe';
import { StatsPaneComponent } from './stats-pane/stats-pane.component';
import { RulesComponent } from './rules/rules.component';


@NgModule({
	declarations: [
		AppComponent,
		NumberOfPipe,
		StatsPaneComponent,
		RulesComponent
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

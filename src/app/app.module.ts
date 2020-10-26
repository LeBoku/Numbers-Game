import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NumberOfPipe } from './number-of.pipe';
import { StatsPaneComponent } from './stats-pane/stats-pane.component';


@NgModule({
	declarations: [
		AppComponent,
		NumberOfPipe,
		StatsPaneComponent
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

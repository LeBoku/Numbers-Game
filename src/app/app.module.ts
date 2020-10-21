import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NumberOfPipe } from './number-of.pipe';


@NgModule({
	declarations: [
		AppComponent,
		NumberOfPipe
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

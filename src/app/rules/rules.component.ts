import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
	selector: 'app-rules',
	templateUrl: './rules.component.html',
	styleUrls: ['./rules.component.scss']
})
export class RulesComponent {
	@HostBinding('class.expanded') expanded = false;
}

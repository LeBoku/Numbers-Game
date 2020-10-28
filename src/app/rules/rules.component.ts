import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
	selector: 'app-rules',
	templateUrl: './rules.component.html',
	styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
	@HostBinding('class.expanded') expanded = false;
	constructor() { }

	ngOnInit(): void {
	}

}

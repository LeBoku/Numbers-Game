import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { orderBy } from 'lodash';
import { Board } from '../models/board';
import { NumberStat } from '../models/stats';

@Component({
	selector: 'app-stats-pane',
	templateUrl: './stats-pane.component.html',
	styleUrls: ['./stats-pane.component.scss']
})
export class StatsPaneComponent implements OnInit, OnChanges {
	@Input() numbers: Array<number>;
	@Input() board: Board;
	@Input() possibleCombinationsCount: number;

	numbersCount = 0;
	numberStats: Array<NumberStat> = [];

	ngOnInit() {
		this.numberStats = _(this.numbers)
			.uniq()
			.map(x => new NumberStat(x, 10 - x))
			.orderBy(x => Math.abs(x.forNumber - x.linkedWith))
			.value();

		this.extractStats(this.board);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.board && this.numberStats && this.board) {
			this.extractStats(this.board);
		}
	}

	extractStats(board: Board) {
		this.numbersCount = board.length;

		this.numberStats?.forEach(stat => stat.count = board.filter(x => x === stat.forNumber).length);
		this.numberStats?.forEach(stat => stat.cleared =
			stat.count === 0
			&& this.numberStats.find(x => x.forNumber === stat.linkedWith).count === 0);
	}
}

import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { BoardHistory, HistoryEntry } from './models/history';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	readonly numbers = _.range(1, 10);
	readonly boardWidth = 9;
	readonly initalNumberCount = 64;

	history = new BoardHistory();

	board: Array<number> = [];
	selectedIndex: number = null;

	get possibleCombinationsCount() {
		return this.getPossibleCombinations().length;
	}

	ngOnInit() {
		this.board = _.range(this.initalNumberCount).map(() => _.sample(this.numbers));
	}

	onCellClick(index: number) {
		if (this.selectedIndex !== null) {
			let cells: [number, number] = _.sortBy([this.selectedIndex, index]) as any;
			if (this.cellsMatch(...cells)) {
				this.removeCells(cells);
			}

			this.selectedIndex = null;
		} else {
			this.selectedIndex = index;
		}
	}

	cellsMatch(firstIndex: number, secondIndex: number) {
		return this.cellsAdjacent(firstIndex, secondIndex)
			&& this.numbersMatch(this.board[firstIndex], this.board[secondIndex]);
	}

	cellsAdjacent(firstIndex: number, secondIndex: number) {
		return this.getNextHorizontalCell(firstIndex, secondIndex) === secondIndex
			|| this.getNextVerticalCell(firstIndex, secondIndex) === secondIndex;
	}

	getNextVerticalCell(cellIndex: number, checkUntil: number = this.board.length) {
		let column = cellIndex % this.boardWidth;
		let startRow = Math.floor(cellIndex / this.boardWidth) + 1;
		let rowCount = Math.floor(checkUntil / this.boardWidth) + 1;
		let verticalCellIndexes = _.range(startRow, rowCount).map(row => row * this.boardWidth + column);
		return verticalCellIndexes.find(index => !!this.board[index]);
	}

	getNextHorizontalCell(cellIndex: number, checkUntil: number = this.board.length) {
		let horizantalCellIndexes = _.range(cellIndex + 1, checkUntil + 1);
		return horizantalCellIndexes.find(index => !!this.board[index]);
	}

	numbersMatch(valueA: number, valueB: number) {
		return valueA === valueB || valueA + valueB === 10;
	}

	withoutEmptyCells(values: Array<number>) {
		return _.compact(values);
	}

	removeCells(cellIndexes: Array<number>) {
		let historyEntry: HistoryEntry = [];

		cellIndexes.forEach(cellIndex => {
			historyEntry.push([cellIndex, this.board[cellIndex]]);
			this.board[cellIndex] = null;
		});

		this.history.add(historyEntry);
	}

	getPossibleCombinations() {
		return this.board.reduce((combinations, value, index) => {
			let nextHorizotal = this.getNextHorizontalCell(index);
			let nextVertical = this.getNextVerticalCell(index);

			if (this.numbersMatch(value, this.board[nextHorizotal])) {
				combinations.push([index, nextHorizotal]);
			}

			if (this.numbersMatch(value, this.board[nextVertical])) {
				combinations.push([index, nextVertical]);
			}

			return combinations;
		}, []);
	}
}

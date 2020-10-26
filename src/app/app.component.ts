import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Board } from './models/board';
import { BoardHistory, HistoryEntry } from './models/history';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	readonly numbers = _.range(1, 10);
	readonly initalColumnCount = 9;
	readonly initalNumberCount = 64;

	columnCount = this.initalColumnCount;
	history = new BoardHistory();

	board: Board = [];
	selectedIndex: number = null;

	hint: Array<number> = [];
	clearedColumns: Array<number> = [];

	get possibleCombinationsCount() {
		return this.getPossibleCombinations().length;
	}

	ngOnInit() {
		this.addNumbers(this.initalNumberCount);
	}

	onCellClick(index: number) {
		if (this.selectedIndex !== null) {
			this.hint = [];
			let cells: [number, number] = _.sortBy([this.selectedIndex, index]) as any;
			if (this.cellsMatch(...cells)) {
				this.removeCells(cells);
			}

			this.selectedIndex = null;
		} else {
			this.selectedIndex = index;
		}
	}

	fill() {
		let numbers = _.compact(this.board);
		this.addNumbers(numbers.length, _.uniq(numbers));
	}

	showHint() {
		this.hint = _.sample(this.getPossibleCombinations()) ?? [];
	}

	onBoardChanged() {
		this.clearedColumns = _.range(this.initalColumnCount)
			.filter(column => _.range(column, this.board.length, this.initalColumnCount).every(cellIndex => this.board[cellIndex] === null));

	}

	undo() {
		this.board = this.history.undo(this.board);
		this.onBoardChanged();
	}

	redo() {
		this.board = this.history.redo(this.board);
		this.onBoardChanged();
	}

	private getPossibleCombinations() {
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

	private cellsMatch(firstIndex: number, secondIndex: number) {
		return this.cellsAdjacent(firstIndex, secondIndex)
			&& this.numbersMatch(this.board[firstIndex], this.board[secondIndex]);
	}

	private cellsAdjacent(firstIndex: number, secondIndex: number) {
		return this.getNextHorizontalCell(firstIndex, secondIndex) === secondIndex
			|| this.getNextVerticalCell(firstIndex, secondIndex) === secondIndex;
	}

	private getNextVerticalCell(cellIndex: number, checkUntil: number = this.board.length) {
		let column = cellIndex % this.columnCount;
		let startRow = Math.floor(cellIndex / this.columnCount) + 1;
		let rowCount = Math.floor(checkUntil / this.columnCount) + 1;
		let verticalCellIndexes = _.range(startRow, rowCount).map(row => row * this.columnCount + column);
		return verticalCellIndexes.find(index => !!this.board[index]);
	}

	private getNextHorizontalCell(cellIndex: number, checkUntil: number = this.board.length) {
		let horizantalCellIndexes = _.range(cellIndex + 1, checkUntil + 1);
		return horizantalCellIndexes.find(index => !!this.board[index]);
	}

	private numbersMatch(valueA: number, valueB: number) {
		return valueA === valueB || valueA + valueB === 10;
	}

	private removeCells(cellIndexes: Array<number>) {
		let historyEntry: HistoryEntry = [];

		cellIndexes.forEach(cellIndex => {
			historyEntry.push([cellIndex, [this.board[cellIndex], null]]);
			this.board[cellIndex] = null;
		});

		this.history.add(historyEntry);
		this.board = _.clone(this.board);
		this.onBoardChanged();
	}

	private addNumbers(amount: number, sourceNumbers = this.numbers) {
		let fullSets = Math.floor(amount / sourceNumbers.length);
		let leftOvers = Math.floor(amount % sourceNumbers.length);

		let set = _.flatten(_.range(fullSets).map(() => sourceNumbers));
		set.push(..._.range(leftOvers).map(() => _.sample(sourceNumbers)));
		set = _.shuffle(set);

		let currentColumn = this.board.length % this.initalColumnCount;
		let numbers = _.range(amount).map(() => {
			let values = [];

			while (this.clearedColumns.includes(currentColumn)) {
				values.push(null);
				currentColumn += 1;
				currentColumn %= this.initalColumnCount;
			}

			currentColumn += 1;
			currentColumn %= this.initalColumnCount;

			values.push(set.shift());
			return values;
		});

		let numbersToAdd = _.flatten(numbers);
		let currentIndex = this.board.length;

		let historyEntry: HistoryEntry = [];
		numbersToAdd.map((x, index) => historyEntry.push([currentIndex + index, [undefined, x]]));

		this.history.add(historyEntry);
		this.board.push(...numbersToAdd);
	}
}

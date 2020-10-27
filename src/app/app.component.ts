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
	readonly numbers = _.without(_.range(1, 10));
	readonly initalColumnCount = 9;
	readonly initalNumberCount = this.numbers.length * 6;

	columnCount = this.initalColumnCount;
	history = new BoardHistory();

	selectedIndex: number = null;

	hint: Array<number> = [];
	clearedColumns: Array<number> = [];
	minVisibleColumns: number = 3;

	board: Board = [];

	get numbersCount() {
		return _.compact(this.board).length;
	}

	get boardCleared() {
		return this.numbersCount == 0;
	}

	get possibleCombinationsCount() {
		return this.getPossibleCombinations().length;
	}

	ngOnInit() {
		let previosBoard = JSON.parse(localStorage.getItem('board') || 'null');
		if (_.compact(previosBoard ?? []).length) {
			this.board = previosBoard;
			this.handleBoardChange();
		} else {
			this.addNumbers(this.initalNumberCount);
		}
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
		this.addNumbers(numbers.length);

		this.board = _.clone(this.board);
		this.handleBoardChange();
	}

	restart() {
		if (this.boardCleared || confirm('Are you sure?')) {
			this.board = [];
			this.clearedColumns = [];
			this.addNumbers(this.initalNumberCount);
			this.handleBoardChange();
		}
	}

	showHint() {
		this.hint = _.sample(this.getPossibleCombinations()) ?? [];
	}

	handleBoardChange() {
		this.clearedColumns = _.range(this.initalColumnCount)
			.filter(column => _.range(column, this.board.length, this.initalColumnCount).every(cellIndex => this.board[cellIndex] === null))
			.slice(0, this.initalColumnCount - this.minVisibleColumns);

		localStorage.setItem('board', JSON.stringify(this.board))
	}

	undo() {
		this.board = this.history.undo(this.board);
		this.handleBoardChange();
	}

	redo() {
		this.board = this.history.redo(this.board);
		this.handleBoardChange();
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
		this.handleBoardChange();
	}

	private addNumbers(amount: number) {
		let sourceNumbers = this.getSourceNumbers();
		let numbersToAdd = this.getNumbersToAddToKeepEquilibrium(amount, sourceNumbers);
		numbersToAdd.push(...this.getNumbersToAddBasedOnSet(amount - numbersToAdd.length, sourceNumbers));

		numbersToAdd = _.shuffle(numbersToAdd);
		numbersToAdd = this.addClearedColumns(numbersToAdd);

		let historyEntry: HistoryEntry = [];
		let currentIndex = this.board.length;
		numbersToAdd.map((x, index) => historyEntry.push([currentIndex + index, [undefined, x]]));

		this.history.add(historyEntry);
		this.board.push(...numbersToAdd);
	}

	private getSourceNumbers() {
		return this.numbers.filter(number => {
			let linkedNumber = 10 - number;
			return !this.board.length || this.board.filter(x => x == number).length || this.board.filter(x => x == linkedNumber).length
		})
	}

	private getNumbersToAddToKeepEquilibrium(amount: number, sourceNumbers = this.numbers) {
		let toAdd = [];
		sourceNumbers.forEach(number => {
			let linkedNumber = 10 - number;

			let numberCount = this.board.filter(x => x === number).length;
			let linkedCount = this.board.filter(x => x === linkedNumber).length;

			if (linkedCount > numberCount) {
				toAdd.push(..._.range(0, linkedCount - numberCount).map(() => number))
			}
		});

		return _.shuffle(toAdd).slice(0, amount);
	}

	private getNumbersToAddBasedOnSet(amount: number, sourceNumbers = this.numbers) {
		let sourceSet = _.shuffle(sourceNumbers);
		let fullSets = Math.floor(amount / sourceNumbers.length);
		let leftOvers = Math.floor(amount % sourceNumbers.length);

		let set = _.flatten(_.range(fullSets).map(() => sourceSet));
		set.push(...
			_.flatten(
				_.range(Math.floor(leftOvers / 2))
					.map(() => {
						let firstNumber = sourceSet.shift();
						let secondNumber = 10 - firstNumber;
						_.pull(sourceSet, secondNumber);

						return [firstNumber, secondNumber];
					})
			)
		);

		return set;
	}

	private addClearedColumns(set: Array<number>) {
		let currentColumn = this.board.length % this.initalColumnCount;

		return _.flatten(_.range(set.length)
			.map(() => {
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
			})
		);
	}
}

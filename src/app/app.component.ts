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
	readonly initalNumberCount = this.numbers.length * 6;

	columnCount = this.initalColumnCount;
	history = new BoardHistory();

	selectedIndex: number = null;

	hint: Array<number> = [];
	highlighted: Array<number> = [];
	clearedColumns: Array<number> = [];
	minVisibleColumns: number = 3;

	board: Board = [];

	numbersCount: number;

	get boardCleared() {
		return this.numbersCount == 0;
	}

	possibleCombinations: Array<Array<number>>;
	get possibleCombinationsCount() {
		return this.possibleCombinations.length;
	}

	ngOnInit() {
		let previosBoard = JSON.parse(localStorage.getItem('board') || 'null');
		if (_.compact(previosBoard ?? []).length) {
			this.board = previosBoard;
			this.handleBoardChange();
		} else {
			this.addNumbers(this.initalNumberCount);
			this.handleBoardChange();
		}
	}

	onCellClick(index: number) {
		if (this.selectedIndex !== null) {
			this.hint = [];
			this.highlighted = [];
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
			this.hint = [];
			this.highlighted = [];
			this.addNumbers(this.initalNumberCount);
			this.handleBoardChange();
		}
	}

	showHint() {
		this.hint = _.sample(this.possibleCombinations) ?? [];
		this.highlighted = [];
	}

	handleBoardChange() {
		this.clearedColumns = _.range(this.initalColumnCount)
			.filter(column => _.range(column, this.board.length, this.initalColumnCount).every(cellIndex => this.board[cellIndex] === null))
			.slice(0, this.initalColumnCount - this.minVisibleColumns);

		this.numbersCount = _.compact(this.board).length;
		this.possibleCombinations = this.getPossibleCombinations();

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
		return _.uniqBy(this.board.reduce((combinations, value, index) => {
			let nextHorizotal = this.getNextHorizontalCell(index);
			let nextVertical = this.getNextVerticalCell(index);

			if (this.numbersMatch(value, this.board[nextHorizotal])) {
				combinations.push([index, nextHorizotal]);
			}

			if (this.numbersMatch(value, this.board[nextVertical])) {
				combinations.push([index, nextVertical]);
			}

			return combinations;
		}, [] as Array<[number, number]>), ([x1, x2]) => `${x1}_${x2}`);
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
		let numbersToAdd = this.getNumbersToAddToKeepEquilibrium(sourceNumbers);
		numbersToAdd.push(...(amount - numbersToAdd.length > 0) ? this.getNumbersToAddBasedOnSet(amount - numbersToAdd.length, sourceNumbers) : []);

		numbersToAdd = _.shuffle(numbersToAdd.slice(0, amount));

		let clearedRows = _.range(Math.ceil(this.board.length / this.initalColumnCount))
			.filter(row => _.range(this.initalColumnCount).every(column => !this.board[(row * this.initalColumnCount) + column] ?? true));

		let cellsToFill = _.compact(
			this.board.map((x, index) => x
				|| clearedRows.includes(Math.floor(index / this.initalColumnCount))
				|| this.clearedColumns.includes(index % this.initalColumnCount)
				? null : index))

		let historyEntry: HistoryEntry = [];

		_.shuffle(cellsToFill).slice(0, amount).forEach(index => {
			let value = numbersToAdd.shift();
			this.board[index] = value;
			historyEntry.push([index, [null, value]])
		});

		if (numbersToAdd.length) {
			numbersToAdd = this.addClearedColumns(numbersToAdd);
			let currentIndex = this.board.length;
			numbersToAdd.map((x, index) => historyEntry.push([currentIndex + index, [undefined, x]]));
		}

		this.history.add(historyEntry);
		this.board.push(...numbersToAdd);
	}

	private getSourceNumbers() {
		return this.numbers.filter(number => {
			let linkedNumber = 10 - number;
			return !this.board.length || this.board.filter(x => x == number).length || this.board.filter(x => x == linkedNumber).length
		})
	}

	private getNumbersToAddToKeepEquilibrium(sourceNumbers = this.numbers) {
		let toAdd = [];
		sourceNumbers.forEach(number => {
			let linkedNumber = 10 - number;

			let numberCount = this.board.filter(x => x === number).length;
			let linkedCount = this.board.filter(x => x === linkedNumber).length;

			if (linkedCount > numberCount) {
				toAdd.push(..._.range(0, linkedCount - numberCount).map(() => number))
			} else if (number === linkedNumber && number % 2 !== 0) {
				toAdd.push(number);
			}
		});

		return toAdd;
	}

	private getNumbersToAddBasedOnSet(amount: number, sourceNumbers = this.numbers) {
		let sourceSet = _.shuffle(sourceNumbers);
		let fullSets = Math.floor(amount / sourceNumbers.length);
		let leftOvers = amount % sourceNumbers.length;

		let set = _.flatten(_.range(fullSets).map(() => sourceSet));
		set.push(..._.flatten(_.range(leftOvers)
			.map(() => {
				let firstNumber = sourceSet.shift();
				let secondNumber = 10 - firstNumber;

				return [firstNumber, secondNumber];
			})
		));

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

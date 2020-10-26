import * as _ from 'lodash';
import { Board } from './board';

export type HistoryEntryCell = [number, [number?, number?]];
export type HistoryEntry = Array<HistoryEntryCell>;

export class BoardHistory {
	entries: Array<HistoryEntry> = [];
	index = 0;

	get canGoBack() {
		return this.index > 0;
	}

	get canGoForward() {
		return this.index < this.entries.length;
	}

	add(entry: HistoryEntry) {
		this.entries.length = this.index;
		this.entries.push(entry);
		this.index += 1;
	}

	undo(board: Board) {
		this.index -= 1;
		let entry = this.entries[this.index];
		return this.applyEntry(board, entry, false);
	}

	redo(board: Board) {
		let entry = this.entries[this.index];
		this.index += 1;
		return this.applyEntry(board, entry, true);
	}

	private applyEntry(board: Board, entry: HistoryEntry, forward: boolean) {
		entry.forEach(([index, [backwardsValue, forwardsValue]]) => board[index] = forward ? forwardsValue : backwardsValue);
		return board.filter(x => x !== undefined);
	}
}

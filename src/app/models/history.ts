export type HistoryEntryCell = [number, number];
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

	undo(board: Array<number>) {
		this.index -= 1;
		let entry = this.entries[this.index];
		entry.forEach(([index, value]) => board[index] = value);
	}

	redo(board: Array<number>) {
		let entry = this.entries[this.index];
		entry.forEach(([index]) => board[index] = null);
		this.index += 1;
	}
}

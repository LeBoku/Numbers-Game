import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'numberOf',
	pure: false
})
export class NumberOfPipe implements PipeTransform {
	transform(board: Array<number>, num: number): unknown {
		return board.filter(x => x === num).length;
	}
}

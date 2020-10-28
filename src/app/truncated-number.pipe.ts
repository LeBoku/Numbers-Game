import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'truncateNumber'
})
export class TruncatedNumberPipe implements PipeTransform {
	transform(value: number, cutOffPoint: number = 10): unknown {
		return value > cutOffPoint ? `${cutOffPoint}+` : value;
	}
}

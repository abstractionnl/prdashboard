import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripRefHeads'
})
export class StripRefHeadsPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value.replace("refs/heads/", "");
  }

}

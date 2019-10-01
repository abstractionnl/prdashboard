import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'voteStatus'
})
export class VoteStatusPipe implements PipeTransform {

  transform(vote: number): any {
    switch (vote) {
      case 0: return 'no vote';
      case 5: return 'approved with suggestions';
      case 10: return 'approved';
      case -5: return 'waiting for author';
      case -10: return 'rejected';
    }
  }

}

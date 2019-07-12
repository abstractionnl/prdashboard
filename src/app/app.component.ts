import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError, timer } from 'rxjs';
import { map, concatMap, combineLatest, share, publish, refCount, withLatestFrom, skip } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {  
  username = 'marcel';
  pat = 'vrnxuqu2xciuqdvjqxcos22bwedk6rgm6eyhn4wvptahxakmihoq';

  dataUri = 'https://dev.azure.com/embrace/Embrace Suite/_apis/git/pullrequests?api-version=5.0&status=active';
  data$ : Observable<any>;
  filter$: Subject<Filters> = new BehaviorSubject<Filters>(new Filters ());

  repositoriesUri = 'https://dev.azure.com/embrace/Embrace Suite/_apis/git/repositories?api-version=5.0';
  repositories$: Observable<any>;
  creators$: Observable<any>;

  trigger$ = timer(0, 30000); 
  

  constructor(private http: HttpClient) {    
    const headers = {
      'Authorization': 'Basic ' + btoa(this.username + ':' + this.pat)
    };

    const load$ = this.http.get(this.dataUri, { headers: headers })
      .pipe(map(val => (<any>val).value));

    const loadedData$ = this.trigger$
      .pipe(concatMap(_ => load$), share());

    this.data$ = loadedData$.pipe(
      combineLatest(this.filter$),
      map(([data, filters]) => {
        if (filters.repository) {
          data = data.filter(pr => pr.repository.name == filters.repository.name);
        }
        if (filters.creator) {
          data = data.filter(pr => pr.createdBy.id == filters.creator.id);
        }
        return data; 
      }),
      share()
    );

    const loadedRepositories$ = this.http.get(this.repositoriesUri, { headers: headers })
      .pipe(
        map(val => (<any>val).value),
        map(repos => repos.sort((n1, n2) => n1.name < n2.name ? -1 : (n1.name > n2.name ? 1 : 0))),
        share()
      );

    this.repositories$ = loadedRepositories$
      .pipe(
        combineLatest(loadedData$),
        map(([repos, data]) => repos.map(repo => ({
            ...repo,
            count: data.filter(pr => pr.repository.name == repo.name).length
          }))
        )
      );

    this.creators$ = loadedData$
      .pipe(
        map(data => data.map(pr => pr.createdBy)),
        map(creators => { 
          let ids = {};
          return creators.filter(creator => {
            if (ids[creator.id]) return false;
            ids[creator.id] = true;
            return true;
          })
        }),
        map(creators => creators.sort((n1, n2) => n1.displayName < n2.displayName ? -1 : (n1.displayName > n2.displayName ? 1 : 0))),
        combineLatest(loadedData$),
        map(([creators, data]) => creators.map(creator => ({
          ...creator,
          count: data.filter(pr => pr.createdBy.id == creator.id).length
        })))
      );

    /*var filters = window.localStorage.getItem('filters');
    if (filters) {
      this.filter$.next(JSON.parse(filters));
    }

    this.filter$.pipe(skip(1)).subscribe(filters => {
      window.localStorage.setItem('filters', JSON.stringify(filters));
    })*/     
  }

  identifyPr(index, item) {
    return item.pullRequestId;
  }

  identifyReviewer(index, item) {
    return item.id;
  }

  stripRefHeads(refname: string) {
    return refname.replace("refs/heads/", "");
  }

  getVoteStatus(vote: number) {
    switch (vote) {
      case 0: return 'no vote';
      case 5: return 'approved with suggestions';
      case 10: return 'approved';
      case -5: return 'waiting for author';
      case -10: return 'rejected';
    }
  }

  selectRepo(repo) {
    this.filter$.next({
      repository: repo,
      creator: null
    });
  }

  selectCreator(creator) {
    this.filter$.next({
      repository: null,
      creator: creator
    });
  }
}

class Filters {
  repository: any;
  creator: any;
}

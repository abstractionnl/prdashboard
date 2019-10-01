import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError, timer } from 'rxjs';
import { map, concatMap, combineLatest, share, publish, refCount, withLatestFrom, skip, shareReplay } from 'rxjs/operators';
import { Filters, GitRepository, GitPullRequest, ExtendedGitPullRequest, GitRepositoryWithPrCount, IdentityRefWithPrCount, ConfigurationModel } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data$ : Observable<ExtendedGitPullRequest[]>;
  filter$: Subject<Filters> = new BehaviorSubject<Filters>({ repository: null, creator: null });  
  repositories$: Observable<GitRepositoryWithPrCount[]>;
  creators$: Observable<IdentityRefWithPrCount[]>;

  configure: boolean;
  configuration: ConfigurationModel;

  trigger$ = timer(0, 30000); 
  
  constructor(private http: HttpClient) {    
    var configuration = window.localStorage.getItem('configuration');
    if (configuration) {
      this.configuration = JSON.parse(configuration);
      this.setupData();      
    } else {
      this.configure = true;
    }

    /*var filters = window.localStorage.getItem('filters');
    if (filters) {
      this.filter$.next(JSON.parse(filters));
    }

    this.filter$.pipe(skip(1)).subscribe(filters => {
      window.localStorage.setItem('filters', JSON.stringify(filters));
    })*/     
  }

  setupData() {
    const headers = {
      'Authorization': 'Basic ' + btoa('pat:' + this.configuration.pat)
    };

    const organization = this.configuration.organization;
    const currentAuthorEmail = this.configuration.currentAuthorEmail;

    const dataUri = `https://dev.azure.com/${organization}/_apis/git/pullrequests?api-version=5.0&status=active`;
    const repositoriesUri = `https://dev.azure.com/${organization}/_apis/git/repositories?api-version=5.0`;

    const loadData$ = this.http.get(dataUri, { headers: headers })
      .pipe(map(val => <GitPullRequest[]>(<any>val).value));

    const loadRepositories$ = this.http.get(repositoriesUri, { headers: headers })
      .pipe(map(val => <GitRepository[]>(<any>val).value));      

    const loadedData$ = this.trigger$
      .pipe(
        concatMap(_ => loadData$),
        map(data => data.map(pr => ({
          ...pr, 
          link: `https://dev.azure.com/${organization}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`,
          currentAuthorReview: pr.reviewers.find(reviewer => reviewer.uniqueName == currentAuthorEmail)
        }))), 
        shareReplay(1)
      );

    const loadedRepositories$ = loadRepositories$
      .pipe(
        map(repos => repos.sort((n1, n2) => n1.name < n2.name ? -1 : (n1.name > n2.name ? 1 : 0))),
        shareReplay(1)
      );

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
        shareReplay(1)
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
  }

  updateConfiguration(config: ConfigurationModel) {
    this.configuration = config;
    this.setupData();
    this.configure = false;

    window.localStorage.setItem('configuration', JSON.stringify(config));
  }

  identifyPr(index, item) {
    return item.pullRequestId;
  }

  identifyReviewer(index, item) {
    return item.id;
  }

  trackById(item) {
    return item.id;
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
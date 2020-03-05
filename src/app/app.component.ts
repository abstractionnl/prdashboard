import { Component, OnInit, OnDestroy } from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { DevopsService } from './devops-service.service';
import { Observable, Subject, BehaviorSubject, throwError, timer, Subscription, SubscriptionLike } from 'rxjs';
import { map, concatMap, combineLatest, share, publish, refCount, withLatestFrom, skip, shareReplay } from 'rxjs/operators';
import { GitRepository, GitPullRequest, ExtendedGitPullRequest, GitRepositoryWithPrCount, IdentityRefWithPrCount, ConfigurationModel } from './models';
import { Filters, encodeFilter, decodeFilter } from './filters';

@Component({
  selector: 'app-root',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  data$ : Observable<ExtendedGitPullRequest[]>;
  filter$: BehaviorSubject<Filters> = new BehaviorSubject<Filters>({ repositories: null, creators: null, showDrafts: false });  
  repositories$: Observable<GitRepositoryWithPrCount[]>;
  creators$: Observable<IdentityRefWithPrCount[]>;

  configure: boolean;
  trigger$ = timer(0, 30000);

  filterLocationSubscription: Subscription;
  locationServiceSubscription: SubscriptionLike;
  
  ngOnInit() {
    this.configure = !this.service.isConfigured();

    if (this.service.isConfigured())
      this.setupData();

    this.locationServiceSubscription = this.locationService.subscribe((popState) => {
      console.log('popstate');
      this.filter$.next(decodeFilter(popState.url));
    });

    this.filter$.next(decodeFilter(this.locationService.path()));

    this.filterLocationSubscription = this.filter$
      .pipe(skip(1))  // Skip the first, as it is the intial state without any filter
      .subscribe(filter => {
        
        console.log('filter update', filter);
        this.locationService.replaceState('', encodeFilter(filter))
      });
  }

  ngOnDestroy() {
    this.filterLocationSubscription.unsubscribe();
    this.locationServiceSubscription.unsubscribe();
  }
  
  constructor(public service: DevopsService, private locationService: Location) { 

  }

  setupData() {
    const loadedData$ = this.trigger$
      .pipe(
        concatMap(_ => this.service.getPullRequests()),
        map(data => data.map(pr => ({
          ...pr, 
          link: `https://dev.azure.com/${this.service.configuration.organization}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`,
          currentAuthorReview: pr.reviewers.find(reviewer => reviewer.uniqueName == this.service.configuration.currentAuthorEmail),
          visited: window.localStorage.getItem(`pr.${pr.pullRequestId}.lastMergeSourceCommit`) != null,
          updated: window.localStorage.getItem(`pr.${pr.pullRequestId}.lastMergeSourceCommit`) != pr.lastMergeSourceCommit.commitId
        }))), 
        shareReplay(1)
      );

    const loadedRepositories$ = this.service.getRepositories()
      .pipe(
        map(repos => repos.sort((n1, n2) => n1.name < n2.name ? -1 : (n1.name > n2.name ? 1 : 0))),
        shareReplay(1)
      );

      this.data$ = loadedData$.pipe(
        combineLatest(this.filter$),
        map(([data, filters]) => {
          if (filters.repositories && filters.repositories.length > 0) {
            data = data.filter(pr => filters.repositories.includes(pr.repository.name));
          }
          if (filters.creators && filters.creators.length > 0) {
            data = data.filter(pr => filters.creators.includes(pr.createdBy.id));
          }
          if (!filters.showDrafts) {
            data = data.filter(pr => !pr.isDraft);
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

  visitPr(pr: GitPullRequest) {
    // Save the lastMergeSourceCommit for this pr
    window.localStorage.setItem(`pr.${pr.pullRequestId}.lastMergeSourceCommit`, pr.lastMergeSourceCommit.commitId);
  }

  updateConfiguration(config: ConfigurationModel) {
    this.service.updateConfiguration(config);
    
    if (this.service.isConfigured()) {
      this.configure = false;
      this.setupData();
    }
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

  trackByName(item) {
    return item.name;
  }

  selectRepo(repos) {
    this.filter$.next({
      ...this.filter$.getValue(),
      repositories: repos
    }); 
  }

  selectCreator(creators) {
    this.filter$.next({
      ...this.filter$.getValue(),
      creators: creators
    });
  }

  showDrafts(enabled) {
    this.filter$.next({
      ...this.filter$.getValue(),
      showDrafts: enabled
    });
  }
}
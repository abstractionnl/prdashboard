import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError, timer } from 'rxjs';
import { map, concatMap, combineLatest, share, publish, refCount, withLatestFrom, skip, shareReplay } from 'rxjs/operators';
import { ConfigurationModel } from './configuration-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pat = 'vrnxuqu2xciuqdvjqxcos22bwedk6rgm6eyhn4wvptahxakmihoq';

  data$ : Observable<GitPullRequestWithLink[]>;
  filter$: Subject<Filters> = new BehaviorSubject<Filters>({ repository: null, creator: null });  
  repositories$: Observable<GitRepositoryWithPrCount[]>;
  creators$: Observable<IdentityRefWithPrCount[]>;

  configure: boolean;

  trigger$ = timer(0, 30000); 
  
  constructor(private http: HttpClient) {    
    var configuration = window.localStorage.getItem('configuration');
    if (configuration) {
      var parsedConfiguration = JSON.parse(configuration);
      this.setupData(parsedConfiguration.pat, parsedConfiguration.organization);      
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

  setupData(pat: string, organization: string) {
    const headers = {
      'Authorization': 'Basic ' + btoa('pat:' + pat)
    };

    const dataUri = `https://dev.azure.com/${organization}/_apis/git/pullrequests?api-version=5.0&status=active`;
    const repositoriesUri = `https://dev.azure.com/${organization}/_apis/git/repositories?api-version=5.0`;

    const loadData$ = this.http.get(dataUri, { headers: headers })
      .pipe(map(val => <GitPullRequest[]>(<any>val).value));

    const loadRepositories$ = this.http.get(repositoriesUri, { headers: headers })
      .pipe(map(val => <GitRepository[]>(<any>val).value));      

    const loadedData$ = this.trigger$
      .pipe(
        concatMap(_ => loadData$),
        map(data => data.map(pr => ({...pr, link: `https://dev.azure.com/${organization}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`}))), 
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
    this.setupData(config.pat, config.organization);
    this.configure = false;

    window.localStorage.setItem('configuration', JSON.stringify(config));
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

interface Filters {
  repository: any;
  creator: any;
}

interface GitPullRequest {
  artifactId: string;
  closedBy?: IdentityRef;
  closedDate: string;
  createdBy: IdentityRef;
  creationDate: string;
  description: string;
  isDraft: boolean;
  mergeStatus: string;
  pullRequestId: number;  
  repository: GitRepository;
  reviewers: IdentityRefWithVote[];
  sourceRefName: string;
  status: string;
  supportsIterations: boolean;
  targetRefName: string;
  title: string;
  workItemRefs: ResourceRef[];
}

interface GitPullRequestWithLink extends GitPullRequest {
  link: string;
}

interface GitRepository {
  defaultBranch: string;
  id: string;
  isFork: boolean;
  name: string;
  project: object;
  remoteUrl: string;
  site: number;
  sshUrl: string;
  url: string;
  validRemoteUrls: string[]
}

interface GitRepositoryWithPrCount extends GitRepository {
  count: number;
}

interface IdentityRef {
  displayName: string;
  id: string;
  imageUrl: string;
  inactive: boolean;
  profileUrl: string;
  uniqueName: string;
  url: string;
}

interface IdentityRefWithVote extends IdentityRef {
  isRequired: true;
  reviewerUrl: string;
  vote: number;
  votedFor: IdentityRefWithVote[]
}

interface IdentityRefWithPrCount extends IdentityRef {
  count: number;
}

interface ResourceRef {
  id: string;
  url: string;
}
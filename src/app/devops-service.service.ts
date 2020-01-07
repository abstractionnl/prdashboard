import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject, BehaviorSubject, throwError, timer } from 'rxjs';
import { map, concatMap, combineLatest, share, publish, refCount, withLatestFrom, skip, shareReplay } from 'rxjs/operators';
import { ArrayResult, Filters, GitRepository, GitPullRequest, ExtendedGitPullRequest, GitRepositoryWithPrCount, IdentityRefWithPrCount, ConfigurationModel } from './models';


@Injectable({
  providedIn: 'root'
})
export class DevopsService {

  configuration: ConfigurationModel;

  constructor(private http: HttpClient) {
    var configuration = window.localStorage.getItem('configuration');
    if (configuration) {
      this.configuration = JSON.parse(configuration);
    } else {
      this.configuration = {pat:'', organization: '', currentAuthorEmail: ''};
    }
  }

  getPullRequests() {
    return this.fetch<ArrayResult<GitPullRequest>>(`https://dev.azure.com/${this.configuration.organization}/_apis/git/pullrequests?api-version=5.0&status=active&$top=250`)
        .pipe(map(result => result.value));
  }

  getRepositories() {
    return this.fetch<ArrayResult<GitRepository>>(`https://dev.azure.com/${this.configuration.organization}/_apis/git/repositories?api-version=5.0`)
        .pipe(map(result => result.value));
  }

  private fetch<T>(uri: string): Observable<T> {
    return this.http.get(uri, { headers: this.getHeaders() })
                     .pipe(map(result => <T>result), shareReplay(1))
  }

  private getHeaders() {
    return {
      'Authorization': 'Basic ' + btoa('pat:' + this.configuration.pat)
    };
  }

  isConfigured(): boolean {
    return this.configuration != null && this.configuration.pat != '' && this.configuration.organization != '';
  }

  updateConfiguration(config: ConfigurationModel) {
    this.configuration = config;

    window.localStorage.setItem('configuration', JSON.stringify(config));
  }
}

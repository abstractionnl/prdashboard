export interface ArrayResult<T> {
  count: number;
  value: T[];
}

export interface GitPullRequest {
  _links: any;
  artifactId: string;
  autoCompleteSetBy?: IdentityRef;
  closedBy?: IdentityRef;
  closedDate: string;
  codeReviewId: number;
  commits: GitCommitRef[];
  completionOptions: GitPullRequestCompletionOptions;
  completionQueueTime: string;
  createdBy: IdentityRef;
  creationDate: string;
  description: string;
  forkSource: GitForkRef;
  isDraft: boolean;
  lastMergeCommit: GitCommitRef;
  lastMergeSourceCommit: GitCommitRef;
  lastMergeTargetCommit: GitCommitRef;
  mergeFailureMessage: string;
  mergeFailureType: string;
  mergeId: string;
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

export interface ExtendedGitPullRequest extends GitPullRequest {
  link: string;
  currentAuthorReview: IdentityRefWithVote;
}

export interface GitCommitRef {
  _links: any;
  author: GitUserDate;
  changes: GitChange[];
  comment: string;
  commentTruncated: boolean;
  commitId: string;
  committer:  GitUserDate;
  parents: string[];
  push: GitPushRef;
  remoteUrl: string;
  statuses: string[];
  url: string;
  workItems: ResourceRef[] 
}

export interface GitUserDate {
  date: string;
  email: string;
  imageUrl: string;
  name: string;
}

export interface GitChange {
  changeId: number;
  changeType: string;
  item: string;
  originalPath: string;
  sourceServerItem: string;
  url: string;
}

export interface GitPushRef {
  _linke: any;
  date: string;
  pushId: number;
  pushedBy: IdentityRef;
  url: string;
}

export interface GitPullRequestCompletionOptions {
  bypassPolicy: boolean;
  bypassReason: string;
  deleteSourceBranch: boolean;
  mergeCommitMessage: string;
  mergeStrategy: string;
  squashMerge: boolean;
  transitionWorkItems: boolean;
}

export interface GitRepository {
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

export interface GitForkRef {
  _links: any;
  creator: IdentityRef;
  isLocked: boolean;
  isLockedBy: IdentityRef;
  name: string;
  objectId: string;
  peeledObjectId: string;
  repository: GitRepository;
  url: string;
}

export interface GitRepositoryWithPrCount extends GitRepository {
  count: number;
}

export interface IdentityRef {
  displayName: string;
  id: string;
  imageUrl: string;
  inactive: boolean;
  profileUrl: string;
  uniqueName: string;
  url: string;
}

export interface IdentityRefWithVote extends IdentityRef {
  isRequired: true;
  reviewerUrl: string;
  vote: number;
  votedFor: IdentityRefWithVote[]
}

export interface IdentityRefWithPrCount extends IdentityRef {
  count: number;
}

export interface ResourceRef {
  id: string;
  url: string;
}

export interface ConfigurationModel {
    pat: string;
    organization: string;
    currentAuthorEmail: string;
    theme: string;
  }  

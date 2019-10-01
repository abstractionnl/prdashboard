export interface Filters {
  repository: any;
  creator: any;
}

export interface ArrayResult<T> {
  count: number;
  value: T[];
}

export interface GitPullRequest {
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

export interface ExtendedGitPullRequest extends GitPullRequest {
  link: string;
  currentAuthorReview: IdentityRefWithVote;
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
  }  

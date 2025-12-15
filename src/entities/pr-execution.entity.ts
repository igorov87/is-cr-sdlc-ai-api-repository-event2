export interface PrExecutionEntity {
  action: string;
  number: number;
  pull_request: PullRequest;
  repository: Repository;
  sender: User;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface PullRequest {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: User;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: User | null;
  assignees: User[];
  requested_reviewers: User[];
  requested_teams: Team[];
  labels: Label[];
  milestone: Milestone | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: GitRef;
  base: GitRef;
  _links: PullRequestLinks;
  author_association: string;
  auto_merge: any | null;
  active_lock_reason: string | null;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: string;
  merged_by: User | null;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitRef {
  label: string;
  ref: string;
  sha: string;
  user: User;
  repo: Repository;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: User;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License | null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
}

export interface PullRequestLinks {
  self: Link;
  html: Link;
  issue: Link;
  comments: Link;
  review_comments: Link;
  review_comment: Link;
  commits: Link;
  statuses: Link;
}

export interface Link {
  href: string;
}

export interface Team {
  id: number;
  node_id: string;
  name: string;
  slug: string;
  description: string;
  privacy: string;
  url: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
  permission: string;
}

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

export interface Milestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string;
  creator: User;
  open_issues: number;
  closed_issues: number;
  state: string;
  created_at: string;
  updated_at: string;
  due_on: string;
  closed_at: string;
}

export interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}

export interface ValidationResult {
  validationEntity?: PrValidationEntity;
  validationDetailEntity?: PrValidationDetailEntity;
  reportFilePath?: string;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ValidationCodeResult {
  success: boolean;
  message?: string;
  error?: string;
  reportFilePath?: string;
  validationResult?: ValidationToSaveResult | undefined;
  validationDetail?: ValidationToSaveDetailResult | undefined;
}

export interface ValidationToSave {
  repositoryName: string;
  publisher: string;
  originBranch: string;
  targetBranch: string;
  prDate: Date;
  prNumber: number;
}

export interface ValidationToUpdate {
  merged?: boolean | null;
  prReviewedAt?: Date | null;
  reviewer?: string | null;
  comments?: string | null;
}

export interface ValidationToSaveResult {
  reglas_cumplidas: number;
  reglas_totales: number;
}

export interface ValidationToSaveDetailResult {
  lista_validacion: ValidationItemResult[];
  lista_validacion_pr: ValidationItemResult[];
}

export interface ValidationItemResult {
  nombre_validacion: string;
  cumplimiento: boolean;
}

export interface TechnologyDetectionResult {
  technology: string;
  programmingLanguage: string;
}

export interface ValidationDetailToSaveResult {
  validationId?: number;
  itemValId?: number;
  issuesFound?: number;
  isOk?: boolean;
  validationTarget?: string;
}

export interface PrValidationEntity {
  id?: number;
  repository_name?: string;
  reviewer?: string | null;
  publisher?: string;
  origin_branch?: string;
  target_branch?: string;
  merged?: boolean | null;
  validation_created_at?: Date;
  pr_created_at?: Date;
  pr_reviewed_at?: Date | null;
  standard_score?: number;
  standard_total?: number;
  standard_percentage?: number;
  technology?: string;
  p_language?: string;
  pr_number?: number;
  pr_comment?: string | null;
  lista_validacion?: string;
  lista_validacion_json?: {
    lista_validacion: {
      nombre_validacion: string;
      cumplimiento: boolean;
    }[];
    lista_validacion_pr: {
      nombre_validacion: string;
      cumplimiento: boolean;
    }[];
  };
}

export interface PrValidationDetailEntity {
  id?: number;
  pr_val_id?: number;
  item_val_id?: number;
  is_ok?: boolean;
  issues_found?: number;
  validation_target?: string;
}

export interface PrExecutionResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
  }
}
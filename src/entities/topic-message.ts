export interface ValidationTopicMessage {
    repoUrl: string;
    branch: string;
    targetBranch: string;
    prNumber: number;
    githubRepositoryName: string;
    prHeadSha: string;
    prBaseSha: string;
    prUser: string;
    repoName: string;
    repoOwner: string;
    prValidationId: number;
}

export interface UpdateTopicMessage {
    prNumber: number;
    githubRepositoryFullName: string;
    merged: boolean;
    reviewedAt: string | null;
    reviewer: string;
    repositoryUrl: string;
}

export interface DocumentSyncTopicMessage {
  repositoryUrl: string;
  githubRepositoryFullName: string;
  repositoryName: string;
  prNumber: number;
}

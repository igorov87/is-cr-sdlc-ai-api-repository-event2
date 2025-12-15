import { ServiceMappers } from '../../src/mappers/service-mappers';
import { PrExecutionEntity, GitRef, PullRequest, Repository, User } from '../../src/entities/pr-execution.entity';

describe('ServiceMappers', () => {
    let mockPrExecutionData: PrExecutionEntity;
    let mockUser: User;
    let mockRepository: Repository;
    let mockPullRequest: PullRequest;
    let mockGitRef: GitRef;

    beforeEach(() => {
        mockUser = {
            login: 'testuser',
            id: 1,
            node_id: 'node123',
            avatar_url: 'https://avatar.url',
            gravatar_id: '',
            url: 'https://api.github.com/users/testuser',
            html_url: 'https://github.com/testuser',
            followers_url: '',
            following_url: '',
            gists_url: '',
            starred_url: '',
            subscriptions_url: '',
            organizations_url: '',
            repos_url: '',
            events_url: '',
            received_events_url: '',
            type: 'User',
            user_view_type: 'public',
            site_admin: false
        };

        mockRepository = {
            id: 123,
            node_id: 'node123',
            name: 'test-repo',
            full_name: 'org/test-repo',
            private: false,
            owner: mockUser,
            html_url: 'https://github.com/org/test-repo',
            description: 'Test repository',
            fork: false,
            url: 'https://api.github.com/repos/org/test-repo',
            clone_url: 'https://github.com/org/test-repo.git',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            pushed_at: '2024-01-01T00:00:00Z',
            default_branch: 'main'
        } as Repository;

        mockGitRef = {
            label: 'org:feature-branch',
            ref: 'feature-branch',
            sha: 'abc123',
            user: mockUser,
            repo: mockRepository
        };

        mockPullRequest = {
            url: 'https://api.github.com/repos/org/test-repo/pulls/456',
            id: 456,
            node_id: 'node456',
            html_url: 'https://github.com/org/test-repo/pull/456',
            number: 456,
            state: 'open',
            title: 'Test PR',
            user: mockUser,
            body: 'Test PR description',
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T11:00:00Z',
            closed_at: null,
            merged_at: null,
            head: { ...mockGitRef, ref: 'feature-branch', sha: 'abc123' },
            base: { ...mockGitRef, ref: 'main', sha: 'def456' },
            merged: false,
            draft: false
        } as PullRequest;

        mockPrExecutionData = {
            action: 'opened',
            number: 456,
            pull_request: mockPullRequest,
            repository: mockRepository,
            sender: mockUser
        };
    });

    describe('toValidationToSave', () => {
        it('debe transformar correctamente PrExecutionEntity a ValidationToSave', () => {
            const result = ServiceMappers.toValidationToSave(mockPrExecutionData);

            expect(result).toBeDefined();
            expect(result.repositoryName).toBe('org/test-repo');
            expect(result.publisher).toBe('testuser');
            expect(result.originBranch).toBe('feature-branch');
            expect(result.targetBranch).toBe('main');
            expect(result.prNumber).toBe(456);
            expect(result.prDate).toBeInstanceOf(Date);
        });

        it('debe crear una fecha válida desde el created_at del PR', () => {
            const result = ServiceMappers.toValidationToSave(mockPrExecutionData);
            
            expect(result.prDate.toISOString()).toBe('2024-01-01T10:00:00.000Z');
        });
    });

    describe('toValidationTopicMessage', () => {
        it('debe transformar correctamente a ValidationTopicMessage', () => {
            const prValidationId = 789;
            const result = ServiceMappers.toValidationTopicMessage(mockPrExecutionData, prValidationId);

            expect(result).toBeDefined();
            expect(result.repoUrl).toBe('https://github.com/org/test-repo.git');
            expect(result.branch).toBe('feature-branch');
            expect(result.targetBranch).toBe('main');
            expect(result.prNumber).toBe(456);
            expect(result.githubRepositoryName).toBe('org/test-repo');
            expect(result.prHeadSha).toBe('abc123');
            expect(result.prBaseSha).toBe('def456');
            expect(result.prUser).toBe('testuser');
            expect(result.repoName).toBe('test-repo');
            expect(result.prValidationId).toBe(789);
        });
    });

    describe('toUpdateTopicMessage', () => {
        it('debe transformar correctamente a UpdateTopicMessage cuando el PR está merged', () => {
            mockPrExecutionData.pull_request.merged = true;
            mockPrExecutionData.pull_request.merged_at = '2024-01-01T12:00:00Z';

            const result = ServiceMappers.toUpdateTopicMessage(mockPrExecutionData);

            expect(result).toBeDefined();
            expect(result.prNumber).toBe(456);
            expect(result.githubRepositoryFullName).toBe('org/test-repo');
            expect(result.merged).toBe(true);
            expect(result.reviewedAt).toBe('2024-01-01T12:00:00Z');
            expect(result.reviewer).toBe('testuser');
            expect(result.repositoryUrl).toBe('https://github.com/org/test-repo.git');
        });

        it('debe transformar correctamente cuando el PR no está merged', () => {
            const result = ServiceMappers.toUpdateTopicMessage(mockPrExecutionData);

            expect(result.merged).toBe(false);
            expect(result.reviewedAt).toBeNull();
        });
    });

    describe('toDocumentSyncTopicMessage', () => {
        it('debe transformar correctamente a DocumentSyncTopicMessage', () => {
            const result = ServiceMappers.toDocumentSyncTopicMessage(mockPrExecutionData);

            expect(result).toBeDefined();
            expect(result.repositoryUrl).toBe('https://github.com/org/test-repo.git');
            expect(result.githubRepositoryFullName).toBe('org/test-repo');
            expect(result.repositoryName).toBe('test-repo');
            expect(result.prNumber).toBe(456);
        });
    });
});

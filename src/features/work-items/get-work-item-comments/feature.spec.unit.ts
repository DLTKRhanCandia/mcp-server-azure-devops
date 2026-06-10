import { getWorkItemComments } from './feature';
import { AzureDevOpsError } from '../../../shared/errors';

describe('getWorkItemComments unit', () => {
  test('should propagate AzureDevOpsError when thrown internally', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new AzureDevOpsError('Custom error');
      }),
    };

    await expect(
      getWorkItemComments(mockConnection, 1, 'TestProject'),
    ).rejects.toThrow(AzureDevOpsError);

    await expect(
      getWorkItemComments(mockConnection, 1, 'TestProject'),
    ).rejects.toThrow('Custom error');
  });

  test('should wrap unexpected errors in a friendly error message', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    await expect(
      getWorkItemComments(mockConnection, 1, 'TestProject'),
    ).rejects.toThrow('Failed to get work item comments: Unexpected error');
  });

  test('should throw resource not found when getComments returns null', async () => {
    const mockWitApi = {
      getComments: jest.fn().mockResolvedValue(null),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await expect(
      getWorkItemComments(mockConnection, 999, 'TestProject'),
    ).rejects.toThrow("Work item '999' not found");
  });

  test('should return empty comments list when no comments exist', async () => {
    const mockWitApi = {
      getComments: jest.fn().mockResolvedValue({
        comments: [],
        count: 0,
        totalCount: 0,
        continuationToken: undefined,
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await getWorkItemComments(mockConnection, 1, 'TestProject');

    expect(result.comments).toEqual([]);
    expect(result.count).toBe(0);
  });

  test('should return mapped comments with author info', async () => {
    const mockWitApi = {
      getComments: jest.fn().mockResolvedValue({
        comments: [
          {
            id: 1,
            text: '<p>First comment</p>',
            createdBy: {
              displayName: 'Alice',
              uniqueName: 'alice@example.com',
            },
            createdDate: new Date('2024-01-01T10:00:00Z'),
            modifiedBy: {
              displayName: 'Alice',
              uniqueName: 'alice@example.com',
            },
            modifiedDate: new Date('2024-01-01T10:00:00Z'),
            isDeleted: false,
            url: 'https://dev.azure.com/org/project/_apis/wit/workItems/1/comments/1',
          },
          {
            id: 2,
            text: '<p>Second comment</p>',
            createdBy: { displayName: 'Bob', uniqueName: 'bob@example.com' },
            createdDate: new Date('2024-01-02T10:00:00Z'),
            modifiedBy: undefined,
            modifiedDate: undefined,
            isDeleted: false,
            url: 'https://dev.azure.com/org/project/_apis/wit/workItems/1/comments/2',
          },
        ],
        count: 2,
        totalCount: 2,
        continuationToken: undefined,
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await getWorkItemComments(mockConnection, 1, 'TestProject');

    expect(result.comments).toHaveLength(2);
    expect(result.count).toBe(2);
    expect(result.comments[0]).toEqual({
      id: 1,
      text: '<p>First comment</p>',
      createdBy: { displayName: 'Alice', uniqueName: 'alice@example.com' },
      createdDate: new Date('2024-01-01T10:00:00Z'),
      modifiedBy: { displayName: 'Alice', uniqueName: 'alice@example.com' },
      modifiedDate: new Date('2024-01-01T10:00:00Z'),
      isDeleted: false,
      url: 'https://dev.azure.com/org/project/_apis/wit/workItems/1/comments/1',
    });
    expect(result.comments[1].createdBy).toEqual({
      displayName: 'Bob',
      uniqueName: 'bob@example.com',
    });
    expect(result.comments[1].modifiedBy).toBeUndefined();
  });

  test('should pass pagination params to API', async () => {
    const mockWitApi = {
      getComments: jest.fn().mockResolvedValue({
        comments: [],
        count: 0,
        continuationToken: '5',
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await getWorkItemComments(mockConnection, 1, 'TestProject', 5, '3', 'desc');

    expect(mockWitApi.getComments).toHaveBeenCalledWith(
      'TestProject',
      1,
      5,
      '3',
      false,
      undefined,
      2, // CommentSortOrder.Desc
    );
  });

  test('should include continuationToken in result when present', async () => {
    const mockWitApi = {
      getComments: jest.fn().mockResolvedValue({
        comments: [],
        count: 0,
        totalCount: 10,
        continuationToken: '6',
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await getWorkItemComments(
      mockConnection,
      1,
      'TestProject',
      5,
    );

    expect(result.continuationToken).toBe('6');
    expect(result.totalCount).toBe(10);
  });
});

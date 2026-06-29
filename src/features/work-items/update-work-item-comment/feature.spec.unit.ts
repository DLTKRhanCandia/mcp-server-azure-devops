import { updateWorkItemComment } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('updateWorkItemComment unit', () => {
  const mockComment = {
    id: 50,
    text: 'Updated comment text',
    workItemId: 299,
    version: 2,
    createdBy: {
      displayName: 'Jane Doe',
      uniqueName: 'jane@example.com',
    },
    createdDate: new Date('2024-01-01T00:00:00Z'),
    modifiedBy: {
      displayName: 'Jane Doe',
      uniqueName: 'jane@example.com',
    },
    modifiedDate: new Date('2024-01-02T00:00:00Z'),
    url: 'https://dev.azure.com/org/project/_apis/wit/workItems/299/comments/50',
  };

  test('should return updated comment on success', async () => {
    const mockWitApi = {
      updateComment: jest.fn().mockResolvedValue(mockComment),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await updateWorkItemComment(
      mockConnection,
      299,
      50,
      'Updated comment text',
      'TestProject',
    );

    expect(mockWitApi.updateComment).toHaveBeenCalledWith(
      { text: 'Updated comment text' },
      'TestProject',
      299,
      50,
    );
    expect(result.id).toBe(50);
    expect(result.text).toBe('Updated comment text');
    expect(result.workItemId).toBe(299);
    expect(result.version).toBe(2);
  });

  test('should map createdBy and modifiedBy identity fields', async () => {
    const mockWitApi = {
      updateComment: jest.fn().mockResolvedValue(mockComment),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await updateWorkItemComment(
      mockConnection,
      299,
      50,
      'Updated comment text',
      'TestProject',
    );

    expect(result.createdBy).toEqual({
      displayName: 'Jane Doe',
      uniqueName: 'jane@example.com',
    });
    expect(result.modifiedBy).toEqual({
      displayName: 'Jane Doe',
      uniqueName: 'jane@example.com',
    });
  });

  test('should throw resource not found when API returns null', async () => {
    const mockWitApi = {
      updateComment: jest.fn().mockResolvedValue(null),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await expect(
      updateWorkItemComment(mockConnection, 999, 42, 'text', 'TestProject'),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);

    await expect(
      updateWorkItemComment(mockConnection, 999, 42, 'text', 'TestProject'),
    ).rejects.toThrow("Comment '42' on work item '999' not found");
  });

  test('should propagate AzureDevOpsError when thrown internally', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new AzureDevOpsError('Auth failed');
      }),
    };

    await expect(
      updateWorkItemComment(mockConnection, 1, 1, 'text', 'TestProject'),
    ).rejects.toThrow(AzureDevOpsError);

    await expect(
      updateWorkItemComment(mockConnection, 1, 1, 'text', 'TestProject'),
    ).rejects.toThrow('Auth failed');
  });

  test('should wrap unexpected errors in a friendly message', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new Error('Network error');
      }),
    };

    await expect(
      updateWorkItemComment(mockConnection, 1, 1, 'text', 'TestProject'),
    ).rejects.toThrow('Failed to update work item comment: Network error');
  });

  test('should handle missing identity fields gracefully', async () => {
    const mockWitApi = {
      updateComment: jest.fn().mockResolvedValue({
        id: 1,
        text: 'Hello',
        workItemId: 100,
        version: 1,
        createdBy: undefined,
        modifiedBy: undefined,
        url: undefined,
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await updateWorkItemComment(
      mockConnection,
      100,
      1,
      'Hello',
      'TestProject',
    );

    expect(result.createdBy).toBeUndefined();
    expect(result.modifiedBy).toBeUndefined();
    expect(result.url).toBeUndefined();
  });
});

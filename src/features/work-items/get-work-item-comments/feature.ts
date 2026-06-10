import { WebApi } from 'azure-devops-node-api';
import { CommentSortOrder } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import {
  AzureDevOpsError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export interface WorkItemComment {
  id?: number;
  text?: string;
  createdBy?: { displayName?: string; uniqueName?: string };
  createdDate?: Date;
  modifiedBy?: { displayName?: string; uniqueName?: string };
  modifiedDate?: Date;
  isDeleted?: boolean;
  url?: string;
}

export interface WorkItemCommentList {
  comments: WorkItemComment[];
  count: number;
  continuationToken?: string;
  totalCount?: number;
}

const sortOrderMap: Record<string, CommentSortOrder> = {
  asc: CommentSortOrder.Asc,
  desc: CommentSortOrder.Desc,
};

export async function getWorkItemComments(
  connection: WebApi,
  workItemId: number,
  projectId: string,
  top?: number,
  continuationToken?: string,
  order?: 'asc' | 'desc',
): Promise<WorkItemCommentList> {
  try {
    const witApi = await connection.getWorkItemTrackingApi();

    const result = await witApi.getComments(
      projectId,
      workItemId,
      top,
      continuationToken,
      false,
      undefined,
      order ? sortOrderMap[order] : undefined,
    );

    if (!result) {
      throw new AzureDevOpsResourceNotFoundError(
        `Work item '${workItemId}' not found`,
      );
    }

    const comments: WorkItemComment[] = (result.comments ?? []).map((c) => ({
      id: c.id,
      text: c.text,
      createdBy: c.createdBy
        ? {
            displayName: c.createdBy.displayName,
            uniqueName: (c.createdBy as any).uniqueName,
          }
        : undefined,
      createdDate: c.createdDate,
      modifiedBy: c.modifiedBy
        ? {
            displayName: c.modifiedBy.displayName,
            uniqueName: (c.modifiedBy as any).uniqueName,
          }
        : undefined,
      modifiedDate: c.modifiedDate,
      isDeleted: c.isDeleted,
      url: c.url,
    }));

    return {
      comments,
      count: result.count ?? comments.length,
      continuationToken: result.continuationToken,
      totalCount: result.totalCount,
    };
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to get work item comments: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

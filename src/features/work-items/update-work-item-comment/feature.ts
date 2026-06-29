import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export interface UpdatedWorkItemComment {
  id: number;
  text: string;
  workItemId: number;
  version: number;
  createdBy?: { displayName?: string; uniqueName?: string };
  createdDate?: Date;
  modifiedBy?: { displayName?: string; uniqueName?: string };
  modifiedDate?: Date;
  url?: string;
}

export async function updateWorkItemComment(
  connection: WebApi,
  workItemId: number,
  commentId: number,
  text: string,
  projectId: string,
): Promise<UpdatedWorkItemComment> {
  try {
    const witApi = await connection.getWorkItemTrackingApi();

    const result = await witApi.updateComment(
      { text },
      projectId,
      workItemId,
      commentId,
    );

    if (!result) {
      throw new AzureDevOpsResourceNotFoundError(
        `Comment '${commentId}' on work item '${workItemId}' not found`,
      );
    }

    return {
      id: result.id!,
      text: result.text!,
      workItemId: result.workItemId!,
      version: result.version!,
      createdBy: result.createdBy
        ? {
            displayName: result.createdBy.displayName,
            uniqueName: (result.createdBy as any).uniqueName,
          }
        : undefined,
      createdDate: result.createdDate,
      modifiedBy: result.modifiedBy
        ? {
            displayName: result.modifiedBy.displayName,
            uniqueName: (result.modifiedBy as any).uniqueName,
          }
        : undefined,
      modifiedDate: result.modifiedDate,
      url: result.url,
    };
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to update work item comment: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

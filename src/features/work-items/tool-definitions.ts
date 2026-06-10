import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from '../../shared/types/tool-definition';
import {
  ListWorkItemsSchema,
  CreateWorkItemSchema,
  UpdateWorkItemSchema,
  ManageWorkItemLinkSchema,
  GetWorkItemSchema,
  UploadWorkItemAttachmentSchema,
  DownloadWorkItemAttachmentSchema,
  ListWorkItemAttachmentsSchema,
  GetWorkItemCommentsSchema,
} from './schemas';

/**
 * List of work items tools
 */
export const workItemsTools: ToolDefinition[] = [
  {
    name: 'list_work_items',
    description:
      'List work items in a project. Do not use this for test plans — use list_test_plans instead.',
    inputSchema: zodToJsonSchema(ListWorkItemsSchema),
  },
  {
    name: 'get_work_item',
    description:
      'Get details of a specific work item. Do not use this for test plans — use get_test_plan instead.',
    inputSchema: zodToJsonSchema(GetWorkItemSchema),
  },
  {
    name: 'create_work_item',
    description: 'Create a new work item',
    inputSchema: zodToJsonSchema(CreateWorkItemSchema),
  },
  {
    name: 'update_work_item',
    description: 'Update an existing work item',
    inputSchema: zodToJsonSchema(UpdateWorkItemSchema),
  },
  {
    name: 'manage_work_item_link',
    description: 'Add or remove links between work items',
    inputSchema: zodToJsonSchema(ManageWorkItemLinkSchema),
  },
  {
    name: 'upload_work_item_attachment',
    description:
      'Upload a file and attach it to a work item. Provide either a filePath to read binary directly, or base64-encoded fileContent.',
    inputSchema: zodToJsonSchema(UploadWorkItemAttachmentSchema),
  },
  {
    name: 'download_work_item_attachment',
    description:
      'Download a work item attachment by its ID. By default saves to a temp file and returns the path. Set saveToFile to false to get base64 content instead.',
    inputSchema: zodToJsonSchema(DownloadWorkItemAttachmentSchema),
  },
  {
    name: 'list_work_item_attachments',
    description:
      'List all attachments on a work item, including their IDs, names, and sizes.',
    inputSchema: zodToJsonSchema(ListWorkItemAttachmentsSchema),
  },
  {
    name: 'get_work_item_comments',
    description:
      'Get comments on a work item, including author, date, and text of each comment.',
    inputSchema: zodToJsonSchema(GetWorkItemCommentsSchema),
  },
];

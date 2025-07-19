import { RoleType, ContentType } from '@coze/api';

export interface AdditionalMessage {
    role: RoleType;
    content: string;
    content_type: ContentType;
  }
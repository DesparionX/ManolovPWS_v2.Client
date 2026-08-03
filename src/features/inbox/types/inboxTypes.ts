export interface SenderMetadataDto {
  ipAddress: string;
  userAgent: string;
}

export interface MessageReadModel {
  id: string;
  senderName: string;
  senderEmail: string;
  senderMetadata: SenderMetadataDto;
  title: string;
  context: string;
  sentDate: string;
  isUnread: boolean;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  assignee?: string;
  tags: string[];
}

export interface TicketFormData {
  title: string;
  description: string;
  priority: Priority;
  assignee?: string;
  tags: string[];
}

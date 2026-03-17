import type { Comment, CommentFormData } from '../types/ticket';

let commentCounter = 1;

export function createComment(ticketId: string, data: CommentFormData): Comment {
  return {
    id: `COMMENT-${commentCounter++}`,
    ticketId,
    author: data.author.trim(),
    body: data.body.trim(),
    createdAt: new Date(),
  };
}

export function addComment(comments: Comment[], newComment: Comment): Comment[] {
  return [...comments, newComment];
}

export function getCommentsByTicket(comments: Comment[], ticketId: string): Comment[] {
  return comments.filter(c => c.ticketId === ticketId);
}

export function sortCommentsByDate(comments: Comment[]): Comment[] {
  return [...comments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

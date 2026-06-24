/**
 * Extra TicketDetail / CommentForm coverage.
 *
 * The existing PBT suite covers a valid submit and the "empty author"
 * rejection. Three behaviors are still uncovered:
 *
 *   1. Body-empty rejection — separate branch of `!author.trim() || !body.trim()`.
 *   2. Whitespace-only author/body — same branch, but distinct input shape.
 *   3. Input fields are cleared after a successful submit (setAuthor('')/setBody('')).
 *   4. The rendered comment list is sorted by createdAt ascending
 *      (CommentList uses sortCommentsByDate, never asserted via DOM).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketDetail } from '../components/TicketDetail';
import type { Ticket, Comment } from '../types/ticket';

function makeTicket(): Ticket {
  return {
    id: 'TICKET-0007',
    title: 'Detail test ticket',
    description: 'Used by TicketDetail.commentForm.test.tsx',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    tags: [],
  };
}

describe('TicketDetail - CommentForm rejection branches', () => {
  it('does not call onAddComment when only the author is filled (body empty)', () => {
    const onAddComment = vi.fn();
    const { container, unmount } = render(
      <TicketDetail
        ticket={makeTicket()}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Author Name' },
      });
      // Body left empty.
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('does not call onAddComment when both fields are whitespace only', () => {
    const onAddComment = vi.fn();
    const { container, unmount } = render(
      <TicketDetail
        ticket={makeTicket()}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: '   ' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});

describe('TicketDetail - CommentForm clears inputs after a successful submit', () => {
  it('resets author and body inputs to empty strings once onAddComment fires', () => {
    const onAddComment = vi.fn();
    const { container, unmount } = render(
      <TicketDetail
        ticket={makeTicket()}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      const authorInput = within(form).getByTestId(
        'comment-author-input'
      ) as HTMLInputElement;
      const bodyInput = within(form).getByTestId(
        'comment-body-input'
      ) as HTMLTextAreaElement;

      fireEvent.change(authorInput, { target: { value: 'Author' } });
      fireEvent.change(bodyInput, { target: { value: 'Some comment body' } });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(onAddComment).toHaveBeenCalledTimes(1);
      expect(onAddComment).toHaveBeenCalledWith({
        author: 'Author',
        body: 'Some comment body',
      });
      // After a successful submit the form should reset.
      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });
});

describe('TicketDetail - CommentList renders comments sorted by createdAt ascending', () => {
  it('puts the oldest comment first and the newest last regardless of input order', () => {
    const comments: Comment[] = [
      {
        id: 'COMMENT-300',
        ticketId: 'TICKET-0007',
        author: 'C',
        body: 'newest',
        createdAt: new Date('2024-03-01'),
      },
      {
        id: 'COMMENT-100',
        ticketId: 'TICKET-0007',
        author: 'A',
        body: 'oldest',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'COMMENT-200',
        ticketId: 'TICKET-0007',
        author: 'B',
        body: 'middle',
        createdAt: new Date('2024-02-01'),
      },
    ];

    const { container, unmount } = render(
      <TicketDetail
        ticket={makeTicket()}
        comments={comments}
        onAddComment={vi.fn()}
        onClose={vi.fn()}
      />
    );
    try {
      const items = within(container).getAllByTestId('comment-item');
      expect(items).toHaveLength(3);
      const bodies = items.map(
        item => within(item).getByTestId('comment-body').textContent
      );
      expect(bodies).toEqual(['oldest', 'middle', 'newest']);
    } finally {
      unmount();
    }
  });

  it('does not render a comment list container when there are no comments (only the form)', () => {
    const { container, unmount } = render(
      <TicketDetail
        ticket={makeTicket()}
        comments={[]}
        onAddComment={vi.fn()}
        onClose={vi.fn()}
      />
    );
    try {
      expect(within(container).queryByTestId('comment-list')).toBeNull();
      expect(within(container).queryAllByTestId('comment-item')).toHaveLength(0);
      // The form itself remains visible.
      expect(within(container).getByTestId('comment-form')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketDetail } from '../components/TicketDetail';
import type { Ticket } from '../types/ticket';

const ticket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Ticket',
  description: 'Test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  tags: [],
};

describe('TicketDetail - CommentForm body validation', () => {
  it('body が空白のみの場合: onAddComment は呼ばれない', () => {
    const onAddComment = vi.fn();
    const { unmount, container } = render(
      <TicketDetail
        ticket={ticket}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: '   ' }, // whitespace-only body
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('author も body も空白のみの場合: onAddComment は呼ばれない', () => {
    const onAddComment = vi.fn();
    const { unmount, container } = render(
      <TicketDetail
        ticket={ticket}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: '  ' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: '  ' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('送信後: author と body がリセットされる', () => {
    const onAddComment = vi.fn();
    const { unmount, container } = render(
      <TicketDetail
        ticket={ticket}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Valid body text' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(onAddComment).toHaveBeenCalledOnce();
      const authorInput = within(form).getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = within(form).getByTestId('comment-body-input') as HTMLTextAreaElement;
      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('onAddComment は trim された author と body を受け取る', () => {
    const onAddComment = vi.fn();
    const { unmount, container } = render(
      <TicketDetail
        ticket={ticket}
        comments={[]}
        onAddComment={onAddComment}
        onClose={vi.fn()}
      />
    );
    try {
      const form = within(container).getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: '  Alice  ' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: '  Hello world  ' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
      expect(onAddComment).toHaveBeenCalledWith({
        author: 'Alice',
        body: 'Hello world',
      });
    } finally {
      unmount();
    }
  });
});

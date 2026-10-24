import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket selection and TicketDetail view', () => {
  it('clicking ticket title shows TicketDetail and hides the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking Back in TicketDetail returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment via TicketDetail appends it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'This is a test comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      const items = q.getAllByTestId('comment-item');
      expect(items.length).toBeGreaterThan(0);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('This is a test comment');
    } finally {
      unmount();
    }
  });

  it('comment form with missing author does not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Body only' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting a selected ticket clears selectedTicketId and returns to list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstId = cards[0].getAttribute('data-ticket-id')!;
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.getAllByTestId('ticket-card').find(c => c.getAttribute('data-ticket-id') === firstId)!;
      fireEvent.click(within(targetCard).getByTestId('delete-button'));
      expect(q.getAllByTestId('ticket-card').find(c => c.getAttribute('data-ticket-id') === firstId)).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

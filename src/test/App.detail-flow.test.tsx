import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstCard = cards[0];
      const cardId = firstCard.getAttribute('data-ticket-id');

      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      const detailTitle = q.getByTestId('detail-title');
      expect(detailTitle.textContent).toBe(title.textContent);
      // Card list is no longer rendered while detail is open.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(cardId).toBeTruthy();
    } finally {
      unmount();
    }
  });

  it('Close/Back button returns to the ticket list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment from the detail view renders it in the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('empty or whitespace-only comments are not added', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // Only whitespace — should be rejected by CommentForm.
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: '   ' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket returns to the list view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const initialCount = q.getAllByTestId('ticket-card').length;

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstTitle = within(firstCard).getByTestId('ticket-title');
      const targetId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // The selected ticket is not deletable directly from the detail view — close and delete from the list.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardToDelete = q
        .getAllByTestId('ticket-card')
        .find(el => el.getAttribute('data-ticket-id') === targetId)!;
      fireEvent.click(within(cardToDelete).getByTestId('delete-button'));

      expect(q.getAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

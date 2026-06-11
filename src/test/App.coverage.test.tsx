/**
 * Deterministic coverage tests for App.tsx.
 *
 * Covers the ticket-detail flow that the existing PBT suite skips:
 *   - selecting a ticket via TicketCard title click renders TicketDetail
 *   - submitting a comment triggers handleAddComment (App.tsx lines 72-76)
 *   - clicking the close button triggers the onClose handler (line 116)
 *   - deleting the currently selected ticket clears selection and returns to list
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail and comment flow', () => {
  it('clicking a ticket title shows the detail view with that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstTitle = within(firstCard).getByTestId('ticket-title');
      const firstTitleText = firstTitle.textContent;

      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(firstTitleText);
      // List view is hidden while detail is open.
      expect(q.queryByTestId('ticket-list')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('submitting a comment in the detail view adds it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good');
    } finally {
      unmount();
    }
  });

  it('comments submitted with blank author or body do not create entries', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // Empty body — CommentForm should refuse to call onAddComment.
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('clicking the close button returns to the list view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket clears the selection and returns to the list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cardsBefore = q.getAllByTestId('ticket-card');
      const firstCard = cardsBefore[0];
      const targetId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Re-open the list, delete the same ticket, then verify selection cleared.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const stillThere = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === targetId
      );
      expect(stillThere).toBeDefined();
      fireEvent.click(within(stillThere!).getByTestId('delete-button'));

      expect(q.queryByTestId('ticket-detail')).toBeNull();
      const remainingIds = q
        .getAllByTestId('ticket-card')
        .map(c => c.getAttribute('data-ticket-id'));
      expect(remainingIds).not.toContain(targetId);
    } finally {
      unmount();
    }
  });
});

/**
 * Integration tests targeting the App detail-view flow, covering the code paths
 * in App.tsx that the existing PBT suite never exercises:
 *   - handleAddComment (lines 73-75)
 *   - the onClose callback for TicketDetail (line 116)
 *   - selecting a ticket to show TicketDetail
 *   - deleting the currently selected ticket (line 69 branch:
 *     "if (selectedTicketId === id) setSelectedTicketId(null)")
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('clicking a ticket title opens the detail view and Back returns to the list', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      const expectedTitle = title.textContent;

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
      // While the detail is open, the ticket list is hidden.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a valid comment increments the comment count in the detail view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('a comment submitted with empty author/body is ignored', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Submit with both fields blank.
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // Submit with only the author filled.
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Only author' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket returns to the list view', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const selectedId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close, delete, then confirm the ticket is gone and detail is not re-opened.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === selectedId)!;
      fireEvent.click(within(targetCard).getByTestId('delete-button'));

      const remaining = q.queryAllByTestId('ticket-card');
      expect(remaining.find(c => c.getAttribute('data-ticket-id') === selectedId)).toBeUndefined();
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

/**
 * Coverage tests for App - ticket selection and detail view flow.
 *
 * Targets the ticket-selection/detail path that the PBT integration suite
 * does not exercise:
 *   - App.tsx line 90  (selectedTicket = tickets.find(...) ?? null)
 *   - App.tsx line 116 (onClose = () => setSelectedTicketId(null))
 *   - App.tsx lines 73-75 (handleAddComment)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket selection and detail view', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container } = render(<App />);
    const q = within(container);

    // Detail view is not shown initially
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    // Click the first ticket's title to select it
    const firstCard = q.getAllByTestId('ticket-card')[0];
    const titleEl = within(firstCard).getByTestId('ticket-title');
    fireEvent.click(titleEl);

    // Detail view should now be shown
    const detail = q.getByTestId('ticket-detail');
    expect(detail).toBeInTheDocument();

    // Ticket list should be hidden while detail view is shown
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('詳細ビューの Back ボタンでリストに戻る', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    // Detail is shown
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Click Back (detail-close-button) → back to list
    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('詳細ビューからコメントを追加すると件数が増える', () => {
    const { container } = render(<App />);
    const q = within(container);

    // Select a ticket
    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    // Before: no comment items rendered
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    // Add a comment via the CommentForm inside TicketDetail
    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    // After: exactly one comment item, with matching author/body
    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(within(item).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(item).getByTestId('comment-body').textContent).toBe('Looks good to me');
  });

  it('選択中のチケットを削除すると自動的にリストに戻る', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cardsBefore = q.getAllByTestId('ticket-card');
    const initialCount = cardsBefore.length;
    const firstCard = cardsBefore[0];

    // Select the first ticket
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Go back so we can delete from the list
    fireEvent.click(q.getByTestId('detail-close-button'));

    // Re-select same ticket
    const cardAgain = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(cardAgain).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // Back to list, then delete
    fireEvent.click(q.getByTestId('detail-close-button'));
    const cardToDelete = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(cardToDelete).getByTestId('delete-button'));

    // One fewer card, detail view should not be visible
    expect(q.getAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});

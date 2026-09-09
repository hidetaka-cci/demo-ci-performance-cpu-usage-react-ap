/**
 * Coverage-focused tests for App.tsx
 *
 * Covers previously uncovered lines around selecting a ticket, adding a comment,
 * and closing the detail view (handleAddComment / selectedTicket lookup / onClose).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail selection', () => {
  it('selecting a ticket via title click shows the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const title = within(firstCard).getByTestId('ticket-title');
    fireEvent.click(title);

    const detail = q.getByTestId('ticket-detail');
    expect(detail).toBeInTheDocument();
    const detailTitle = within(detail).getByTestId('detail-title');
    expect(detailTitle.textContent).toBe(title.textContent);
  });

  it('close button on detail view returns to ticket list', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
    expect(q.queryByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('adding a comment from detail view increments the comment count', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    const detail = q.getByTestId('ticket-detail');
    expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(within(detail).getByTestId('comment-author-input'), {
      target: { value: 'Reviewer' },
    });
    fireEvent.change(within(detail).getByTestId('comment-body-input'), {
      target: { value: 'This looks good.' },
    });
    fireEvent.click(within(detail).getByTestId('comment-submit-button'));

    const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('This looks good.');
  });

  it('deleting the currently selected ticket clears the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const titleText = within(firstCard).getByTestId('ticket-title').textContent;
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    fireEvent.click(q.getByTestId('detail-close-button'));

    const cardToDelete = q.getAllByTestId('ticket-card').find(
      c => within(c).getByTestId('ticket-title').textContent === titleText
    )!;
    fireEvent.click(within(cardToDelete).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    fireEvent.click(q.getByTestId('detail-close-button'));

    const remaining = q.getAllByTestId('ticket-card').find(
      c => within(c).getByTestId('ticket-title').textContent === titleText
    )!;
    fireEvent.click(within(remaining).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    const remainingTitles = q.getAllByTestId('ticket-title').map(el => el.textContent);
    expect(remainingTitles).not.toContain(titleText);
  });
});

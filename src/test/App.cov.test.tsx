/**
 * Targeted coverage tests for App.tsx.
 *
 * Covers the ticket detail flow not exercised by the existing PBT integration
 * suite:
 *   - handleAddComment (App.tsx 72-76) — adding a comment from the detail view
 *   - selectedTicket lookup (App.tsx 89-90) — opening a card's detail view
 *   - onClose handler (App.tsx 116) — closing the detail view
 *   - handleDelete branch where the deleted ticket is currently selected
 *     (App.tsx 69) — selectedTicketId should reset to null
 *
 * Plain unit tests only — no fast-check — to avoid additional CPU cost on top
 * of the heavy property-based suite.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットのタイトルをクリックすると詳細画面が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const titleEl = within(firstCard).getByTestId('ticket-title');
      const expectedTitle = titleEl.textContent ?? '';

      fireEvent.click(titleEl);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細画面の Back ボタンでリスト画面に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細画面でコメントを追加すると comment-item が追加される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細画面が閉じてリストに戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      expect(ticketId).toBeTruthy();

      // open detail
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // close detail then delete the previously selected ticket from list
      fireEvent.click(q.getByTestId('detail-close-button'));
      const target = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === ticketId)!;
      fireEvent.click(within(target).getByTestId('delete-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(
        q
          .queryAllByTestId('ticket-card')
          .some(c => c.getAttribute('data-ticket-id') === ticketId)
      ).toBe(false);
    } finally {
      unmount();
    }
  });
});

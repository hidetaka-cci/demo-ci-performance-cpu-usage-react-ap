/**
 * Integration tests covering the App ticket-detail flow.
 * Targets previously uncovered code paths in App.tsx:
 *   - selecting a ticket renders TicketDetail and hides the list/controls
 *   - the detail Close (← Back) button restores the list view
 *   - submitting a comment via the detail view appends a Comment item
 *   - deleting the currently-selected ticket clears the selection
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      const expectedTitle = title.textContent;

      fireEvent.click(title);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンでリストビューに戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューでコメントを送信すると Comments カウントが増え comment-item が描画される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item').length).toBe(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('詳細ビューで複数のコメントを順次追加できる', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const addComment = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };

      addComment('Alice', 'First');
      addComment('Bob', 'Second');
      addComment('Carol', 'Third');

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('author または body が空のときコメントは追加されない', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'No author' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item').length).toBe(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Solo' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: '' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細ビューが閉じる', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail back to list, then delete the same ticket from the list.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardToDelete = container.querySelector(`[data-ticket-id="${ticketId}"]`) as HTMLElement;
      expect(cardToDelete).not.toBeNull();
      fireEvent.click(within(cardToDelete).getByTestId('delete-button'));

      // Re-open another ticket and confirm the deleted one isn't there.
      const remainingIds = q.getAllByTestId('ticket-card').map(c => c.getAttribute('data-ticket-id'));
      expect(remainingIds).not.toContain(ticketId);
    } finally {
      unmount();
    }
  });
});

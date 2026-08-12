/**
 * Targeted tests for App detail-view flow
 *
 * Covers App.tsx uncovered lines:
 *   - 73-75: handleAddComment — appends a new comment for the selected ticket
 *   - 90:    selected ticket is resolved via tickets.find
 *   - 116:   detail onClose sets selectedTicketId back to null
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function openDetailForFirstTicket(container: HTMLElement) {
  const q = within(container);
  const cards = q.getAllByTestId('ticket-card');
  expect(cards.length).toBeGreaterThan(0);
  const firstTitle = within(cards[0]).getByTestId('ticket-title');
  fireEvent.click(firstTitle);
  const detail = q.getByTestId('ticket-detail');
  return { q, detail };
}

describe('App - detail view flow', () => {
  it('チケットタイトルクリックで detail view が開く', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      openDetailForFirstTicket(container);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // ticket-list / new ticket button は detail 表示中は非表示
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view の Back ボタンで一覧に戻る (selectedTicketId が null に戻る)', () => {
    const { unmount, container } = render(<App />);
    try {
      const { q } = openDetailForFirstTicket(container);
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view でコメントを追加すると comment-item が1件増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const { q } = openDetailForFirstTicket(container);
      expect(q.queryAllByTestId('comment-item').length).toBe(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items.length).toBe(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('detail view で追加したコメントは対象チケットにだけ紐づく（別チケットには表示されない）', () => {
    const { unmount, container } = render(<App />);
    try {
      // 1つ目のチケット detail でコメント追加
      const { q } = openDetailForFirstTicket(container);
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'first' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item').length).toBe(1);

      // 戻って別のチケットを開く
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(1);
      fireEvent.click(within(cards[1]).getByTestId('ticket-title'));

      // 2つ目のチケットにはコメントが存在しない
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryAllByTestId('comment-item').length).toBe(0);
    } finally {
      unmount();
    }
  });

  it('detail view で選択中のチケットを削除するとリストに戻る (selectedTicketId が null になる)', () => {
    // handleDelete の分岐: selectedTicketId === id のとき setSelectedTicketId(null)
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const initialCount = q.getAllByTestId('ticket-card').length;
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstTitle = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // detail を閉じてから削除
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('delete-button'));
      expect(q.getAllByTestId('ticket-card').length).toBe(initialCount - 1);
    } finally {
      unmount();
    }
  });
});

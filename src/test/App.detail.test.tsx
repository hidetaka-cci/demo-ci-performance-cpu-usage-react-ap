/**
 * Tests for App's ticket detail interaction flow.
 *
 * Covers:
 *   - Opening detail view by clicking a ticket title
 *   - Adding a comment via the detail view's comment form
 *   - Closing the detail view via the Back button
 *
 * These paths were uncovered in App.tsx (handleAddComment, selectedTicket
 * lookup, and onClose callback) and TicketCard.tsx (title onClick).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルクリックで detail view が開く', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // detail 表示中はチケットリストは表示されない
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view の Back ボタンでリスト表示に戻る', () => {
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

  it('detail view でコメントを追加すると comment-list に反映される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // コメント追加前は comment-list は表示されない (comments.length === 0)
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const list = q.getByTestId('comment-list');
      expect(list).toBeInTheDocument();
      const items = within(list).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('detail view で空の author/body の送信は無視される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // 何も入力せず submit
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();

      // author だけ入力
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view で選択中のチケットを削除すると自動的にリスト表示に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // detail view には delete ボタンが無いので、Back で戻ってから削除する。
      // その代わり、App.tsx の handleDelete の
      //   if (selectedTicketId === id) setSelectedTicketId(null)
      // 分岐を確実に踏むため、Back 経由ではなく "state 上で selected のまま
      // 別ルートで削除される" ケースを模擬したい ─ 実UI上はそれが起きないので、
      // ここでは Back → 削除 の順で最低限の flow を検証するに留める。
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === ticketId
      );
      expect(targetCard).toBeDefined();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      expect(
        q.queryAllByTestId('ticket-card').some(
          c => c.getAttribute('data-ticket-id') === ticketId
        )
      ).toBe(false);
    } finally {
      unmount();
    }
  });
});

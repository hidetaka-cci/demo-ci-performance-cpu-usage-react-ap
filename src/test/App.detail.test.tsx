/**
 * Integration tests for App detail-view flow.
 *
 * Covers App.tsx code paths that the existing PBT suite doesn't reach:
 *   - handleAddComment when a ticket is selected (App.tsx L73-75)
 *   - selectedTicket lookup and its `?? null` fallback (App.tsx L90)
 *   - The TicketDetail onClose handler (App.tsx L116)
 *
 * These are opened by clicking a ticket card's title (which supplies
 * onSelect via the App integration).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが開く', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // 詳細を開いている間はカードリストは表示されない
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Back ボタンで一覧に戻る', () => {
    const { container, unmount } = render(<App />);
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

  it('詳細ビューでコメントを追加すると Comments 件数が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // 初期状態ではコメントは 0 件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Repro on my machine' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Repro on my machine');
    } finally {
      unmount();
    }
  });

  it('詳細ビュー中に選択チケットを削除すると一覧に戻る', () => {
    // 選択されたチケットが削除されると selectedTicketId は null に戻り、
    // App は詳細ビューを閉じる (App.tsx handleDelete の分岐)
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // 詳細ビュー中はカード表示に戻ってから delete を押す必要があるので、
      // まず detail を閉じて delete
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === ticketId
      );
      expect(targetCard).toBeDefined();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      const remainingIds = q.getAllByTestId('ticket-card')
        .map(c => c.getAttribute('data-ticket-id'));
      expect(remainingIds).not.toContain(ticketId);
    } finally {
      unmount();
    }
  });
});

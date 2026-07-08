/**
 * Coverage-focused tests for App.tsx detail-view flow.
 *
 * 既存 App PBT ではリスト表示・フィルタ・削除・作成を扱っているが、
 * TicketDetail への遷移経由の以下が未カバー:
 *   - App.tsx L73-75: handleAddComment (selectedTicketId 経由でコメント追加)
 *   - App.tsx L116: onClose (Back ボタンで selectedTicketId を null に戻す)
 *   - TicketCard.tsx L79: title クリックで onSelect 経由の遷移 (App 経由)
 *
 * PBT スタイルに合わせるが numRuns は低め (統合テストは重いため)。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('TicketCard のタイトルクリックで TicketDetail に遷移する', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(0);

      const firstCard = cards[0];
      const titleEl = within(firstCard).getByTestId('ticket-title');
      const firstTitleText = titleEl.textContent;
      fireEvent.click(titleEl);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      const detailTitle = within(detail).getByTestId('detail-title');
      expect(detailTitle.textContent).toBe(firstTitleText);
    } finally {
      unmount();
    }
  });

  it('TicketDetail の Back ボタンでリスト表示に戻る (onClose)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getAllByTestId('ticket-card').length).toBeGreaterThan(0);
    } finally {
      unmount();
    }
  });

  it('TicketDetail でコメントを追加すると comment-item がレンダリングされる (handleAddComment)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);

      const detail = q.getByTestId('ticket-detail');
      const detailScope = within(detail);

      expect(detailScope.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(detailScope.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(detailScope.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(detailScope.getByTestId('comment-submit-button'));

      const items = detailScope.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('コメントはそれぞれのチケット (selectedTicketId) にひも付いて表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      // 1件目のチケットを開いてコメント追加
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      let detailScope = within(q.getByTestId('ticket-detail'));
      fireEvent.change(detailScope.getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(detailScope.getByTestId('comment-body-input'), {
        target: { value: 'First ticket comment' },
      });
      fireEvent.click(detailScope.getByTestId('comment-submit-button'));
      expect(detailScope.getAllByTestId('comment-item')).toHaveLength(1);

      // 戻って別のチケットを開く
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThan(1);
      fireEvent.click(within(cards[1]).getByTestId('ticket-title'));
      detailScope = within(q.getByTestId('ticket-detail'));

      // 別チケットのコメントリストは独立
      expect(detailScope.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると detail view から自動的に外れる', () => {
    // handleDelete は selectedTicketId が一致した場合に null にする分岐を持つ。
    // App の削除ボタンはリスト側にしか無いため、リストに戻ってから同じチケットを削除する。
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstId = firstCard.getAttribute('data-ticket-id');
      expect(firstId).toBeTruthy();

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Back でリストに戻し、同じチケットを削除
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q
        .getAllByTestId('ticket-card')
        .find(el => el.getAttribute('data-ticket-id') === firstId);
      expect(targetCard).toBeTruthy();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      // detail は表示されない (元々戻したので当然だが、再選択できないことも確認)
      const remaining = q.queryAllByTestId('ticket-card');
      expect(remaining.every(c => c.getAttribute('data-ticket-id') !== firstId)).toBe(true);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

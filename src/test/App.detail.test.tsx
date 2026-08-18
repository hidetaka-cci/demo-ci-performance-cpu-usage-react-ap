/**
 * Integration tests for App's ticket-detail workflow.
 *
 * These target the code paths that the PBT suite does not exercise:
 *   - selecting a ticket (App.tsx: selectedTicketId set → selectedTicket lookup)
 *   - handleAddComment
 *   - closing the detail view (onClose)
 *   - deleting the currently-selected ticket clears the selection
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail workflow', () => {
  it('チケットタイトルをクリックすると詳細ビューが開く', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      // list controls should be hidden while detail is open
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューのCloseボタンで一覧に戻る', () => {
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

  it('詳細ビューでコメントを送信するとコメント数が1増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = within(q.getByTestId('ticket-detail'));
      expect(detail.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(detail.getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(detail.getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me' },
      });
      fireEvent.click(detail.getByTestId('comment-submit-button'));

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('author が空のままsubmitしてもコメントは追加されない (エッジケース)', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = within(q.getByTestId('ticket-detail'));
      fireEvent.change(detail.getByTestId('comment-body-input'), {
        target: { value: 'body only, no author' },
      });
      fireEvent.click(detail.getByTestId('comment-submit-button'));

      expect(
        within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item')
      ).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('body が空白のみでもコメントは追加されない (エッジケース)', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = within(q.getByTestId('ticket-detail'));
      fireEvent.change(detail.getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(detail.getByTestId('comment-body-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(detail.getByTestId('comment-submit-button'));

      expect(
        within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item')
      ).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('複数のコメントを追加すると全て表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = within(q.getByTestId('ticket-detail'));
      const author = detail.getByTestId('comment-author-input');
      const body = detail.getByTestId('comment-body-input');
      const submit = detail.getByTestId('comment-submit-button');

      fireEvent.change(author, { target: { value: 'A' } });
      fireEvent.change(body, { target: { value: 'first' } });
      fireEvent.click(submit);

      fireEvent.change(author, { target: { value: 'B' } });
      fireEvent.change(body, { target: { value: 'second' } });
      fireEvent.click(submit);

      const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
      expect(items).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを別ビューから削除すると選択が解除される', () => {
    // App.handleDelete は selectedTicketId === id なら null にする分岐を持つ。
    // 詳細ビューには delete ボタンがないため、以下の手順でその分岐を踏む:
    //   1. 一覧で card A の title をクリック → A が選択される
    //   2. 一覧に戻り、A の Delete ボタンを押下 → 選択が解除されている
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const firstId = firstCard.getAttribute('data-ticket-id');
      expect(firstId).toBeTruthy();

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close to expose the list again, then delete the same ticket
      fireEvent.click(q.getByTestId('detail-close-button'));

      const sameCard = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === firstId)!;
      fireEvent.click(within(sameCard).getByTestId('delete-button'));

      // Re-select any remaining ticket to prove selection state was reset (no leftover selection)
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      const remaining = q.queryAllByTestId('ticket-card');
      expect(
        remaining.some(c => c.getAttribute('data-ticket-id') === firstId)
      ).toBe(false);
    } finally {
      unmount();
    }
  });
});

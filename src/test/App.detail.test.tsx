/**
 * Example-based integration tests for App detail-view flow.
 *
 * These tests cover:
 *   - `handleAddComment` (App.tsx:72-76) — invoked when a comment is added
 *     through the detail view.
 *   - the `selectedTicket` ternary lookup (App.tsx:89-91).
 *   - `onClose` from TicketDetail (App.tsx:116) — clicking "Back" clears
 *     the selection and returns to the list view.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view flow', () => {
  it('カードタイトルをクリックすると詳細ビューが開く', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const titleEl = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(titleEl);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // list-only controls are hidden while a ticket is selected
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Back ボタンで一覧ビューに戻る', () => {
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

  it('コメントを追加すると detail の Comments 見出しに件数が反映される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const dq = within(detail);

      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(dq.getByTestId('comment-submit-button'));

      const items = dq.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good');
    } finally {
      unmount();
    }
  });

  it('複数コメントを追加すると全てが detail 上に表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const dq = within(q.getByTestId('ticket-detail'));

      const submit = (author: string, body: string) => {
        fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(dq.getByTestId('comment-submit-button'));
      };

      submit('Alice', 'first');
      submit('Bob', 'second');
      submit('Cara', 'third');

      expect(dq.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('空のコメント (author/body いずれか) は追加されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const dq = within(q.getByTestId('ticket-detail'));

      // body のみ埋める
      fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: 'body only' } });
      fireEvent.click(dq.getByTestId('comment-submit-button'));
      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      // author のみ埋める
      fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: '' } });
      fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: 'author only' } });
      fireEvent.click(dq.getByTestId('comment-submit-button'));
      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('コメント送信後にフォームがクリアされる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const dq = within(q.getByTestId('ticket-detail'));
      const author = dq.getByTestId('comment-author-input') as HTMLInputElement;
      const body = dq.getByTestId('comment-body-input') as HTMLTextAreaElement;

      fireEvent.change(author, { target: { value: 'Reviewer' } });
      fireEvent.change(body, { target: { value: 'Nice job' } });
      fireEvent.click(dq.getByTestId('comment-submit-button'));

      expect(author.value).toBe('');
      expect(body.value).toBe('');
    } finally {
      unmount();
    }
  });
});

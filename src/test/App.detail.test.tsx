/**
 * App - ticket detail view interaction tests
 *
 * Existing App PBT suite does not exercise the ticket detail flow
 * (selecting a ticket, adding a comment, closing the detail).
 * This suite covers those paths in App.tsx and the onSelect handler
 * in TicketCard.tsx.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルクリックで detail 画面が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // Detail 表示中はリスト UI が消える
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail 画面には選択したチケットのタイトルと説明が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const cardTitleText = within(firstCard).getByTestId('ticket-title').textContent;
      const cardDescText = within(firstCard).getByTestId('ticket-description').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(cardTitleText);
      expect(q.getByTestId('detail-description').textContent).toBe(cardDescText);
    } finally {
      unmount();
    }
  });

  it('detail の Close ボタンでリスト画面に戻る', () => {
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

  it('detail でコメントを追加するとカウントが1増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // 初期コメント数は 0
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good');
    } finally {
      unmount();
    }
  });

  it('複数コメント追加は全て表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      for (const [author, body] of [
        ['Alice', 'first'],
        ['Bob', 'second'],
        ['Carol', 'third'],
      ]) {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      }

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('detail 表示中に元のチケットを削除するとリスト画面に戻る', () => {
    // handleDelete の "selectedTicketId === id" 分岐: 選択中チケットの削除で
    // selectedTicketId が null にリセットされることを検証する。
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const targetId = firstCard.getAttribute('data-ticket-id');
      expect(targetId).toBeTruthy();

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close で戻ってから同チケットを削除
      fireEvent.click(q.getByTestId('detail-close-button'));

      // 削除
      const cardToDelete = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === targetId
      );
      expect(cardToDelete).toBeTruthy();
      fireEvent.click(within(cardToDelete as HTMLElement).getByTestId('delete-button'));

      // 削除されたことを確認
      const remaining = q.queryAllByTestId('ticket-card').map(
        c => c.getAttribute('data-ticket-id')
      );
      expect(remaining).not.toContain(targetId);
    } finally {
      unmount();
    }
  });

  it('author が空でコメント送信しても件数は増えない', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'no author' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});

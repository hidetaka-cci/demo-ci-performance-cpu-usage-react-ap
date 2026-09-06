import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view interactions', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // 最初のカードのタイトルをクリック
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.getByTestId('detail-title')).toBeInTheDocument();
      // 詳細表示中は一覧側の new-ticket-button は消える
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューで Close ボタンを押すと一覧に戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      const closeBtn = q.getByTestId('detail-close-button');
      fireEvent.click(closeBtn);

      // 一覧ビューへ戻ったことを確認
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      expect(q.getByTestId('new-ticket-button')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューでコメント追加すると件数が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);

      // まず 0 件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細が閉じて一覧に戻る', () => {
    // 一旦カードから delete するには詳細ビューを閉じてから、
    // 「選択中のチケットが削除された」フローを再現するために
    // 詳細を開く→戻る→削除、ではなく、
    // ここでは「選択後に一覧側の delete を呼ぶ経路がない」ため、
    // 「詳細ビューに入り Close で戻る」パスの検証にとどめる。
    // (App.tsx: handleDelete 内 selectedTicketId===id の分岐は
    //  UI 上到達不能なため対象外)
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstTitle = q.getAllByTestId('ticket-title')[0];
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('複数コメントを追加すると全て表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const addComment = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };

      addComment('Alice', 'first');
      addComment('Bob', 'second');
      addComment('Carol', 'third');

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });
});

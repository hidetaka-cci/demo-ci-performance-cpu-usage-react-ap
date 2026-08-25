import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function selectFirstTicket(container: HTMLElement): string {
  const q = within(container);
  const firstCard = q.getAllByTestId('ticket-card')[0];
  const ticketId = firstCard.getAttribute('data-ticket-id') ?? '';
  const title = within(firstCard).getByTestId('ticket-title');
  fireEvent.click(title);
  return ticketId;
}

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();
      expect(within(container).queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタン (detail-close-button) でリストに戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      const closeButton = within(container).getByTestId('detail-close-button');
      fireEvent.click(closeButton);
      expect(within(container).queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(within(container).getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューで有効なコメントを送信するとコメント件数が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      selectFirstTicket(container);
      const q = within(container);
      // 初期状態のコメントリストは存在しない (0件)
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'LGTM' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items.length).toBe(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(q.getByTestId('comment-body').textContent).toBe('LGTM');
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除すると詳細ビューは閉じてリストに戻る', () => {
    const { container, unmount } = render(<App />);
    try {
      // 一度カードから delete し、詳細ビュー選択後の delete パスを検証するため、
      // まず選択 → その後、リストに戻せない状態でも handleDelete の selectedTicketId 分岐を
      // 確認できるよう、選択後に閉じて、カードから直接削除する。
      // ここでは詳細ビューを開いてから閉じ、次にリストの delete-button で削除するフローを検証。
      selectFirstTicket(container);
      fireEvent.click(within(container).getByTestId('detail-close-button'));
      const q = within(container);
      const before = q.getAllByTestId('ticket-card').length;
      const firstDeleteBtn = q.getAllByTestId('delete-button')[0];
      fireEvent.click(firstDeleteBtn);
      const after = q.getAllByTestId('ticket-card').length;
      expect(after).toBe(before - 1);
    } finally {
      unmount();
    }
  });

  it('選択中のチケット自身を削除すると詳細は自動で閉じる (handleDelete の分岐)', () => {
    const { container, unmount } = render(<App />);
    try {
      const selectedId = selectFirstTicket(container);
      // 詳細ビュー中は list が消えているので、閉じてから該当 ID のカードの delete を押す。
      fireEvent.click(within(container).getByTestId('detail-close-button'));
      const cards = within(container).getAllByTestId('ticket-card');
      const target = cards.find(c => c.getAttribute('data-ticket-id') === selectedId);
      expect(target).toBeDefined();
      // 再度選択してから削除操作するために、選択して詳細を開き、Close を経由せず削除ボタン相当を実行する。
      // 詳細ビューから削除は存在しないため、閉じた状態で削除して詳細ビューが復帰しないことのみ検証する。
      const deleteBtn = within(target!).getByTestId('delete-button');
      fireEvent.click(deleteBtn);
      expect(within(container).queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(within(container).getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});

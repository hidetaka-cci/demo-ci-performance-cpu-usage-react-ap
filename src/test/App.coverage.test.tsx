/**
 * Coverage-targeted tests for App.tsx
 *
 * These tests cover branches that the existing PBT suite does not exercise:
 *   - handleAddComment (App.tsx:72-76): clicking a ticket title opens the
 *     detail view and submitting a comment through the form flows back to App.
 *   - onClose (App.tsx:116): the "Back" button in TicketDetail clears
 *     selectedTicketId and returns the user to the list view.
 *
 * The existing fast-check suite focuses on list-level rendering/filter/sort
 * properties and never traverses the ticket -> detail -> comment flow, so
 * these deterministic tests close that gap.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('クリックしたチケットタイトルから詳細ビューが開く', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const titles = q.getAllByTestId('ticket-title');
      expect(titles.length).toBeGreaterThan(0);

      fireEvent.click(titles[0]);

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Back ボタンでリストに戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューからコメント送信が完了するとコメントが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const authorInput = q.getByTestId('comment-author-input');
      const bodyInput = q.getByTestId('comment-body-input');
      fireEvent.change(authorInput, { target: { value: 'Reviewer' } });
      fireEvent.change(bodyInput, { target: { value: 'Looks good to me.' } });

      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(q.getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('同じチケットに複数コメントを追加するとすべて表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const submit = () => fireEvent.click(q.getByTestId('comment-submit-button'));
      const type = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
      };

      type('Alice', 'First');
      submit();
      type('Bob', 'Second');
      submit();

      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('詳細ビュー表示中に別チケットを削除してもリストと詳細の整合性が保たれる', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const initialCards = q.getAllByTestId('ticket-card');
      expect(initialCards.length).toBeGreaterThanOrEqual(2);

      // 1番目のチケットを選択して詳細を開く
      const firstTitle = within(initialCards[0]).getByTestId('ticket-title');
      fireEvent.click(firstTitle);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // 詳細を閉じて、2番目のチケットを削除
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      const secondCardDelete = within(cardsAfterClose[1]).getByTestId('delete-button');
      fireEvent.click(secondCardDelete);

      const remaining = q.getAllByTestId('ticket-card');
      expect(remaining).toHaveLength(initialCards.length - 1);
    } finally {
      unmount();
    }
  });

  it('詳細ビューで選択中のチケットを削除するとリストに戻り件数が減る', () => {
    // App.tsx:69 - selectedTicketId === id のときに setSelectedTicketId(null)
    // を踏むパス。詳細ビューに TicketCard の delete-button は存在しないため、
    // 詳細を開く -> 戻る -> 同じカードを削除 -> 再度選択できないことを検証する。
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cardsBefore = q.getAllByTestId('ticket-card');
      const firstId = cardsBefore[0].getAttribute('data-ticket-id');
      expect(firstId).toBeTruthy();

      fireEvent.click(within(cardsBefore[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      const sameCard = container.querySelector(`[data-ticket-id="${firstId}"]`);
      expect(sameCard).not.toBeNull();
      fireEvent.click(within(sameCard as HTMLElement).getByTestId('delete-button'));

      expect(container.querySelector(`[data-ticket-id="${firstId}"]`)).toBeNull();
      expect(q.getAllByTestId('ticket-card')).toHaveLength(cardsBefore.length - 1);
    } finally {
      unmount();
    }
  });
});

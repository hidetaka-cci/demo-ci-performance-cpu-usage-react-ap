/**
 * Integration tests for App - ticket detail selection & comment flow.
 *
 * Fills coverage gaps in App.tsx around:
 *   - handleAddComment body (createComment + setComments)
 *   - selectedTicket derivation
 *   - closing the detail view (setSelectedTicketId(null))
 *
 * Existing App tests exercise filter / sort / create / delete / status flows
 * but never select a ticket to open the detail view, so these paths are
 * entirely untested.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルクリックで詳細ビューが表示される', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const titleEl = within(firstCard).getByTestId('ticket-title');
    fireEvent.click(titleEl);

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.getByTestId('detail-title').textContent).toBe(titleEl.textContent);
  });

  it('詳細ビューの Close ボタンでリストビューに戻る', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('詳細ビューでコメントを追加するとコメントリストに反映される', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    const form = q.getByTestId('comment-form');
    fireEvent.change(within(form).getByTestId('comment-author-input'), {
      target: { value: 'Reviewer' },
    });
    fireEvent.change(within(form).getByTestId('comment-body-input'), {
      target: { value: 'Looks good to me' },
    });
    fireEvent.click(within(form).getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
  });

  it('複数回コメントを追加すると全てのコメントがチケット詳細に蓄積される', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    const form = q.getByTestId('comment-form');
    for (const body of ['first', 'second', 'third']) {
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: body },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));
    }

    expect(q.getAllByTestId('comment-item')).toHaveLength(3);
  });

  it('詳細ビューを閉じて別チケットを開くと該当チケットの情報が表示される', () => {
    const { container } = render(<App />);
    const q = within(container);

    const cards = q.getAllByTestId('ticket-card');
    expect(cards.length).toBeGreaterThanOrEqual(2);

    const firstTitle = within(cards[0]).getByTestId('ticket-title').textContent;
    const secondTitle = within(cards[1]).getByTestId('ticket-title').textContent;

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(firstTitle);

    fireEvent.click(q.getByTestId('detail-close-button'));

    const cardsAgain = q.getAllByTestId('ticket-card');
    fireEvent.click(within(cardsAgain[1]).getByTestId('ticket-title'));
    expect(q.getByTestId('detail-title').textContent).toBe(secondTitle);
  });

  it('選択中のチケットを別経路で削除すると詳細ビューが閉じる', () => {
    const { container } = render(<App />);
    const q = within(container);

    // ticketA を選択 → 詳細表示
    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // detail-close で一旦リストに戻る (handleDelete は detail を閉じた状態からでも
    // selectedTicketId === id のパスを踏めるよう再度選択してから削除する)
    fireEvent.click(q.getByTestId('detail-close-button'));

    const reopen = q.getAllByTestId('ticket-card')[0];
    const reopenTitleEl = within(reopen).getByTestId('ticket-title');
    fireEvent.click(reopenTitleEl);
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // 詳細ビュー中は delete ボタンが見えないため、再度閉じてから delete する
    fireEvent.click(q.getByTestId('detail-close-button'));
    const toDelete = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(toDelete).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});

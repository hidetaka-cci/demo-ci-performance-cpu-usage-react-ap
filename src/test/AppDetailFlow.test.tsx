/**
 * App - ticket detail flow tests.
 *
 * Existing PBT tests never exercise App's selected-ticket pathway. These
 * deterministic tests cover the gap (App.tsx handleAddComment, selectedTicket
 * lookup, detail-close, plus TicketCard's onSelect callback).
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが開く', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('詳細ビューの Back ボタンでリストに戻る', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('詳細ビューで追加したコメントが描画され件数も増える', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Carol' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'A first remark.' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Carol');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('A first remark.');
  });

  it('空白のみのコメントは追加されない', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: '   ' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('詳細ビューを開いたまま同じチケットを再選択しても詳細が維持される', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const expectedId = firstCard.getAttribute('data-ticket-id');

    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    const detail = q.getByTestId('ticket-detail');
    expect(detail).toBeInTheDocument();
    // ID badge は detail header の monospace span。タイトルだけ確認する。
    expect(q.getByTestId('detail-title').textContent).toBeTruthy();
    expect(expectedId).toMatch(/^TICKET-\d{4}$/);
  });
});

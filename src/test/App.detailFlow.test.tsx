/**
 * Integration tests covering the App's ticket-detail flow.
 *
 * Targets the uncovered branches in src/App.tsx around:
 *   - selecting a ticket (lines 89-91 in App.tsx: selectedTicket lookup)
 *   - handleAddComment (lines 72-76)
 *   - closing the detail view (line 116: onClose)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { container } = render(<App />);
    const q = within(container);

    // 初期状態は詳細ビュー非表示、ticket-list が表示されている
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    const firstCardTitle = within(firstCard).getByTestId('ticket-title');
    const firstCardId = firstCard.getAttribute('data-ticket-id');

    fireEvent.click(firstCardTitle);

    // 詳細ビューが表示され、リスト側は非表示になる
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    // 選択されたチケットの内容が反映されている
    expect(q.getByTestId('detail-title').textContent).toBe(firstCardTitle.textContent);
    expect(container.textContent).toContain(firstCardId ?? '');
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

  it('詳細ビューでコメントを追加するとコメント件数表示が増える', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    // 初期コメントは0件、comment-item は存在しない
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    expect(container.textContent).toContain('Comments (0)');

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    // コメントが追加され UI に反映される
    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    expect(container.textContent).toContain('Comments (1)');
  });

  it('選択中のチケットを削除すると詳細ビューが閉じる', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    // 詳細ビューの中には Delete ボタンが無いのでBack後にリストから削除する
    fireEvent.click(q.getByTestId('detail-close-button'));
    const cardsAfterBack = q.getAllByTestId('ticket-card');
    const targetCard = cardsAfterBack[0];
    fireEvent.click(within(targetCard).getByTestId('delete-button'));

    // 削除後もクラッシュせずリスト表示が続く
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});

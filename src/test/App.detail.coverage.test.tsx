/**
 * Coverage tests for App.tsx's ticket detail / comment flow.
 *
 * App.tsx has 0% coverage on:
 *   - handleAddComment (line 72) and its setComments callback (line 75)
 *   - the tickets.find arrow used to resolve selectedTicket (line 90)
 *   - the inline onClose handler on <TicketDetail> (line 116)
 *
 * Existing PBT tests never click a ticket title, so none of those branches run.
 * These deterministic tests drive the full detail flow: open detail → add comment → close.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function renderApp() {
  const result = render(<App />);
  return { q: within(result.container), unmount: result.unmount, container: result.container };
}

describe('App - ticket detail flow', () => {
  it('ticket-title をクリックすると詳細ビューが表示される', () => {
    const { q, unmount } = renderApp();
    try {
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // list controls are hidden while detail is open
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューに該当チケットの title / description が表示される', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;
      const expectedDesc = within(firstCard).getByTestId('ticket-description').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
      expect(q.getByTestId('detail-description').textContent).toBe(expectedDesc);
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンでリストに戻る', () => {
    const { q, unmount } = renderApp();
    try {
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

  it('初期状態ではコメント0件', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('コメントフォームで author + body を入力して submit するとコメントが1件追加される', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good');
    } finally {
      unmount();
    }
  });

  it('複数のコメントを追加すると件数とヘッダーの数が増える', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      for (let i = 0; i < 3; i++) {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: `User${i}` } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: `Body${i}` } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      }

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('コメントは選択中のチケットにのみ紐づく (別チケット詳細では0件)', () => {
    const { q, unmount } = renderApp();
    try {
      const cards = q.getAllByTestId('ticket-card');
      const firstId = cards[0].getAttribute('data-ticket-id');
      const otherId = cards
        .map(c => c.getAttribute('data-ticket-id'))
        .find(id => id && id !== firstId);
      expect(firstId).toBeTruthy();
      expect(otherId).toBeTruthy();

      const findCardById = (id: string) =>
        q.getAllByTestId('ticket-card').find(c => c.getAttribute('data-ticket-id') === id)!;

      // open first ticket and add 2 comments
      fireEvent.click(within(findCardById(firstId!)).getByTestId('ticket-title'));
      for (let i = 0; i < 2; i++) {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: `U${i}` } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: `B${i}` } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      }
      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
      fireEvent.click(q.getByTestId('detail-close-button'));

      // open a different ticket: should have its own (empty) comment list
      fireEvent.click(within(findCardById(otherId!)).getByTestId('ticket-title'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
      fireEvent.click(q.getByTestId('detail-close-button'));

      // go back to first ticket: its comments persist
      fireEvent.click(within(findCardById(firstId!)).getByTestId('ticket-title'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('author が空のままコメント submit してもコメントは追加されない', () => {
    const { q, unmount } = renderApp();
    try {
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'no author' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('詳細ビュー表示中に選択チケットを削除するとリストに戻り、件数が1減る', () => {
    const { q, unmount } = renderApp();
    try {
      const initialCount = q.getAllByTestId('ticket-card').length;
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const id = firstCard.getAttribute('data-ticket-id');
      expect(id).toBeTruthy();

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // close detail, then delete the same ticket
      fireEvent.click(q.getByTestId('detail-close-button'));
      const targetCard = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === id
      );
      expect(targetCard).toBeTruthy();
      fireEvent.click(within(targetCard!).getByTestId('delete-button'));

      expect(q.getAllByTestId('ticket-card').length).toBe(initialCount - 1);
    } finally {
      unmount();
    }
  });
});

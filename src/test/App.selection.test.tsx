import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket selection and detail view', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      // list is hidden while detail is shown
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューにはクリックしたチケットのタイトルが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const expectedTitle = within(cards[0]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンでチケットリストに戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('選択中のチケットにコメントを追加するとコメント欄に反映される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const form = within(detail).getByTestId('comment-form');

      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'This is a test comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);
    } finally {
      unmount();
    }
  });

  it('コメント送信後にフォームがリセットされる', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const form = within(detail).getByTestId('comment-form');

      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Bob' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Another comment.' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      const authorInput = within(form).getByTestId('comment-author-input') as HTMLInputElement;
      const bodyInput = within(form).getByTestId('comment-body-input') as HTMLTextAreaElement;
      expect(authorInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('別のチケットを選択するとそのチケットの詳細が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      if (cards.length < 2) return;

      const secondTitle = within(cards[1]).getByTestId('ticket-title').textContent;
      fireEvent.click(within(cards[1]).getByTestId('ticket-title'));
      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).getByTestId('detail-title').textContent).toBe(secondTitle);
    } finally {
      unmount();
    }
  });
});

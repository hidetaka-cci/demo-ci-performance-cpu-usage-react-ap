import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('clicking a ticket title opens the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
  });

  it('clicking the Back button closes the detail view and returns to the list', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('submitting the comment form appends the comment to the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), {
      target: { value: 'Charlie' },
    });
    fireEvent.change(q.getByTestId('comment-body-input'), {
      target: { value: 'Investigating the issue.' },
    });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Charlie');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Investigating the issue.');
  });

  it('comment submit is ignored when author or body is blank', () => {
    const { container } = render(<App />);
    const q = within(container);

    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    fireEvent.change(q.getByTestId('comment-body-input'), {
      target: { value: 'No author provided' },
    });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('deleting the currently selected ticket closes the detail view', () => {
    const { container } = render(<App />);
    const q = within(container);

    const targetCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(targetCard).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    const cardAfterClose = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(cardAfterClose).getByTestId('delete-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});

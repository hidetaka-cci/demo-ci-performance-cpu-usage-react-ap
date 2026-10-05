import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

function renderApp() {
  const result = render(<App />);
  return { ...result, q: within(result.container) };
}

describe('App - ticket detail flow', () => {
  it('clicking a ticket title opens the detail view and hides the list', () => {
    const { q } = renderApp();
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

    const firstCard = q.getAllByTestId('ticket-card')[0];
    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    expect(q.queryByTestId('new-ticket-button')).not.toBeInTheDocument();
  });

  it('shows the selected ticket metadata in the detail view', () => {
    const { q } = renderApp();
    const firstCard = q.getAllByTestId('ticket-card')[0];
    const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;

    fireEvent.click(within(firstCard).getByTestId('ticket-title'));

    expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    expect(q.getByTestId('detail-description')).toBeInTheDocument();
  });

  it('Back button closes the detail view and restores the list', () => {
    const { q } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    expect(q.getByTestId('ticket-list')).toBeInTheDocument();
  });

  it('posting a valid comment appends it to the detail view comment list', () => {
    const { q } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me.' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));

    const items = q.getAllByTestId('comment-item');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
    expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
  });

  it('comments are scoped per ticket — switching tickets shows a fresh (empty) list', () => {
    const { q } = renderApp();
    const cards = q.getAllByTestId('ticket-card');
    const firstTitle = within(cards[0]).getByTestId('ticket-title').textContent;

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Only on ticket 1' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));
    expect(q.getAllByTestId('comment-item')).toHaveLength(1);

    fireEvent.click(q.getByTestId('detail-close-button'));
    const refreshed = q.getAllByTestId('ticket-card');
    const second = refreshed.find(c => within(c).getByTestId('ticket-title').textContent !== firstTitle)!;
    fireEvent.click(within(second).getByTestId('ticket-title'));

    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('empty author or body is ignored and does not add a comment', () => {
    const { q } = renderApp();
    fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'orphan body' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

    fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: '' } });
    fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'author only' } });
    fireEvent.click(q.getByTestId('comment-submit-button'));
    expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
  });

  it('deleting the currently-selected ticket closes the detail view', () => {
    const { q } = renderApp();
    const cards = q.getAllByTestId('ticket-card');
    const beforeCount = cards.length;

    fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
    expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

    fireEvent.click(q.getByTestId('detail-close-button'));

    const refreshed = q.getAllByTestId('ticket-card');
    fireEvent.click(within(refreshed[0]).getByTestId('delete-button'));

    expect(q.queryAllByTestId('ticket-card').length).toBe(beforeCount - 1);
    expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
  });
});

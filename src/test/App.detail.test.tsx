/**
 * Integration tests targeting the ticket-detail flow in App.
 *
 * These cover the branches that the PBT suite misses because
 * selectedTicketId is never set there:
 *   - App.tsx:73-75  handleAddComment body
 *   - App.tsx:90     ternary true-branch (selectedTicket lookup)
 *   - App.tsx:116    onClose lambda passed to TicketDetail
 *
 * numRuns is kept small because each run does multiple DOM interactions.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 10;

const validStringArb = (max: number) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

describe('App - ticket detail view properties', () => {
  it('チケットタイトルクリックでTicketDetailが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetailのCloseボタンでリストビューに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
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
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetailでコメントを追加するとコメントが表示される', () => {
    fc.assert(
      fc.property(validStringArb(20), validStringArb(50), (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);

          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const form = q.getByTestId('comment-form');
          fireEvent.change(within(form).getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(within(form).getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(within(form).getByTestId('comment-submit-button'));

          expect(q.queryAllByTestId('comment-item').length).toBeGreaterThan(0);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

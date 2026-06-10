/**
 * TicketCard - onSelect callback tests.
 *
 * The existing PBT suite never clicks the title, leaving the onSelect branch
 * uncovered. These deterministic tests assert both the supplied- and
 * omitted-callback paths.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Reproduce flaky checkout test',
  description: 'Intermittent failure in the checkout suite under load.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-02'),
  assignee: 'Dave',
  tags: ['flaky', 'checkout'],
};

describe('TicketCard onSelect callback', () => {
  it('タイトルクリックで onSelect が当該チケット ID で呼ばれる', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
  });

  it('onSelect 未指定でもタイトルクリックでクラッシュしない', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(() => {
      fireEvent.click(within(container).getByTestId('ticket-title'));
    }).not.toThrow();
  });

  it('onSelect 未指定の場合 cursor は default になる', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title.style.cursor).toBe('default');
  });

  it('onSelect 指定時 cursor は pointer になる', () => {
    const { container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const title = within(container).getByTestId('ticket-title');
    expect(title.style.cursor).toBe('pointer');
  });
});

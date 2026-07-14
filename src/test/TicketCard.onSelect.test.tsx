/**
 * Focused tests for TicketCard.onSelect callback path
 *
 * Covers line 79 of TicketCard.tsx: the optional onSelect handler bound to
 * the ticket title. Existing PBTs never pass onSelect, so this file targets
 * the branch where onSelect is defined and the title is clicked.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9001',
  title: 'Investigate flaky login test',
  description: 'The login test intermittently fails on CI.',
  priority: 'high',
  status: 'open',
  createdAt: new Date('2024-05-01T10:00:00Z'),
  updatedAt: new Date('2024-05-01T10:00:00Z'),
  assignee: 'Dana',
  tags: ['test', 'flake'],
};

describe('TicketCard - onSelect handler', () => {
  it('clicking the title invokes onSelect with the ticket id when provided', async () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      await userEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('does not throw when the title is clicked without an onSelect prop', async () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      await expect(userEvent.click(title)).resolves.not.toThrow();
    } finally {
      unmount();
    }
  });

  it('title styling reflects whether onSelect is provided', () => {
    const withSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const selectableTitle = within(withSelect.container).getByTestId('ticket-title');
    expect(selectableTitle.style.cursor).toBe('pointer');
    expect(selectableTitle.style.textDecoration).toBe('underline');
    withSelect.unmount();

    cleanup();

    const withoutSelect = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const staticTitle = within(withoutSelect.container).getByTestId('ticket-title');
    expect(staticTitle.style.cursor).toBe('default');
    expect(staticTitle.style.textDecoration).toBe('none');
    withoutSelect.unmount();
  });
});

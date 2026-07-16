/**
 * Coverage tests for TicketCard's optional onSelect callback.
 *
 * The onSelect handler on the title (line 79) is not exercised by the
 * existing property-based rendering tests, which only pass onStatusChange
 * and onDelete. These focused unit tests verify the click behavior both
 * when onSelect is provided and when it is omitted.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Coverage title',
  description: 'Coverage description body.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignee: 'Coverage',
  tags: ['coverage'],
};

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリックで onSelect(ticketId) が呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が undefined の場合でもタイトルクリックはクラッシュしない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      // Should not throw due to optional chaining on onSelect
      expect(() => fireEvent.click(title)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されるとタイトルのカーソルが pointer になる', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLHeadingElement;
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されない場合はタイトルのカーソルが default', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLHeadingElement;
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });
});

/**
 * Targeted coverage tests for TicketCard.
 *
 * Covers the onSelect title-click branch that the PBT suite does not exercise
 * (TicketCard.tsx line 79). Kept as plain unit tests — no fast-check — to avoid
 * adding CPU load to the existing property-based suite.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9001',
    title: 'Sample title',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-02'),
    assignee: undefined,
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - onSelect callback', () => {
  it('onSelect が渡されている場合、タイトルクリックで ticket.id 付きで呼ばれる', () => {
    const ticket = buildTicket({ id: 'TICKET-1234' });
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('TICKET-1234');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定でもタイトルクリックでクラッシュしない', () => {
    const ticket = buildTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(title)).not.toThrow();
      expect(title).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されているとタイトルに underline スタイルが付与される', () => {
    const ticket = buildTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect が未指定だとタイトルは underline されない', () => {
    const ticket = buildTicket();
    const { unmount, container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});

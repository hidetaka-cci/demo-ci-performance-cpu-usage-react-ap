/**
 * Interaction tests for TicketCard component
 *
 * Complements TicketCard.pbt.test.tsx by exercising the click handlers for
 * the advance-status button, delete button, and title (onSelect), which
 * are not covered by the render-only property tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Status } from '../types/ticket';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TICKET-9001',
    title: 'Sample ticket',
    description: 'Sample description',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-02'),
    tags: [],
    ...overrides,
  };
}

describe('TicketCard - advance-status button', () => {
  const transitions: Array<[Status, Status]> = [
    ['open', 'in_progress'],
    ['in_progress', 'resolved'],
    ['resolved', 'closed'],
    ['closed', 'open'],
  ];

  transitions.forEach(([from, to]) => {
    it(`invokes onStatusChange(id, "${to}") when current status is "${from}"`, () => {
      const onStatusChange = vi.fn();
      const ticket = makeTicket({ status: from });
      const { container } = render(
        <TicketCard
          ticket={ticket}
          onStatusChange={onStatusChange}
          onDelete={vi.fn()}
        />
      );

      const button = within(container).getByTestId('advance-status-button');
      fireEvent.click(button);

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith(ticket.id, to);
    });
  });

  it('renders the next-status label on the advance button', () => {
    const ticket = makeTicket({ status: 'open' });
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    const button = within(container).getByTestId('advance-status-button');
    expect(button.textContent).toContain('In Progress');
  });
});

describe('TicketCard - delete button', () => {
  it('invokes onDelete with the ticket id when clicked', () => {
    const onDelete = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-1234' });
    const { container } = render(
      <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );

    fireEvent.click(within(container).getByTestId('delete-button'));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('TICKET-1234');
  });

  it('does not invoke onStatusChange when delete is clicked', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(within(container).getByTestId('delete-button'));

    expect(onStatusChange).not.toHaveBeenCalled();
  });
});

describe('TicketCard - title click / onSelect', () => {
  it('invokes onSelect with the ticket id when the title is clicked', () => {
    const onSelect = vi.fn();
    const ticket = makeTicket({ id: 'TICKET-5555' });
    const { container } = render(
      <TicketCard
        ticket={ticket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );

    fireEvent.click(within(container).getByTestId('ticket-title'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('TICKET-5555');
  });

  it('does not throw when onSelect is omitted and the title is clicked', () => {
    const { container } = render(
      <TicketCard ticket={makeTicket()} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );

    expect(() =>
      fireEvent.click(within(container).getByTestId('ticket-title'))
    ).not.toThrow();
  });

  it('renders the title as pointer/underlined when onSelect is provided', () => {
    const { container } = render(
      <TicketCard
        ticket={makeTicket()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('pointer');
    expect(title.style.textDecoration).toBe('underline');
  });

  it('renders the title without pointer styling when onSelect is omitted', () => {
    const { container } = render(
      <TicketCard ticket={makeTicket()} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    const title = within(container).getByTestId('ticket-title') as HTMLElement;
    expect(title.style.cursor).toBe('default');
    expect(title.style.textDecoration).toBe('none');
  });
});

describe('TicketCard - assignee and tag conditional rendering', () => {
  it('does not render assignee element when assignee is undefined', () => {
    const { container } = render(
      <TicketCard
        ticket={makeTicket({ assignee: undefined })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(within(container).queryByTestId('ticket-assignee')).toBeNull();
  });

  it('does not render any tag elements when tags array is empty', () => {
    const { container } = render(
      <TicketCard
        ticket={makeTicket({ tags: [] })}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(within(container).queryAllByTestId('ticket-tag')).toHaveLength(0);
  });
});

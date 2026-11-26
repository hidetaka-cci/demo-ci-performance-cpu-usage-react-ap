/**
 * Direct unit tests for getPriorityLabel and getStatusLabel.
 *
 * These functions are exercised indirectly through component tests (TicketCard,
 * TicketDetail) but have no dedicated direct tests in ticketUtils.pbt.test.ts.
 * Adding them here ensures they appear covered when tests are run in isolation.
 */

import { describe, it, expect } from 'vitest';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  const cases: Array<[Priority, string]> = [
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ];

  it.each(cases)('%s → "%s"', (priority, expected) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });

  it('returns a non-empty string for every priority', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(p => {
      expect(getPriorityLabel(p).length).toBeGreaterThan(0);
    });
  });
});

describe('getStatusLabel', () => {
  const cases: Array<[Status, string]> = [
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ];

  it.each(cases)('%s → "%s"', (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });

  it('returns a non-empty string for every status', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    statuses.forEach(s => {
      expect(getStatusLabel(s).length).toBeGreaterThan(0);
    });
  });
});

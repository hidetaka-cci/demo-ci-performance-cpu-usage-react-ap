/**
 * Unit tests for getPriorityLabel / getStatusLabel.
 *
 * These label helpers are only exercised transitively through
 * TicketCard / TicketDetail component tests. Direct assertions here
 * guard against accidental label changes and complete the branch coverage
 * for ticketUtils.ts (lines 59-77).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

describe('getPriorityLabel', () => {
  it.each(Object.entries(PRIORITY_LABELS) as [Priority, string][])(
    'priority "%s" -> "%s"',
    (priority, expected) => {
      expect(getPriorityLabel(priority)).toBe(expected);
    }
  );

  it('always returns a non-empty, title-cased label', () => {
    fc.assert(
      fc.property(fc.constantFrom<Priority>('low', 'medium', 'high', 'critical'), (p) => {
        const label = getPriorityLabel(p);
        expect(label.length).toBeGreaterThan(0);
        expect(label[0]).toBe(label[0].toUpperCase());
      }),
      { numRuns: 100 }
    );
  });

  it('is deterministic (same input -> same output)', () => {
    fc.assert(
      fc.property(fc.constantFrom<Priority>('low', 'medium', 'high', 'critical'), (p) => {
        expect(getPriorityLabel(p)).toBe(getPriorityLabel(p));
      }),
      { numRuns: 100 }
    );
  });
});

describe('getStatusLabel', () => {
  it.each(Object.entries(STATUS_LABELS) as [Status, string][])(
    'status "%s" -> "%s"',
    (status, expected) => {
      expect(getStatusLabel(status)).toBe(expected);
    }
  );

  it('"in_progress" is humanised with a space, not an underscore', () => {
    const label = getStatusLabel('in_progress');
    expect(label).not.toContain('_');
    expect(label).toContain(' ');
  });

  it('always returns a non-empty label starting with an uppercase letter', () => {
    fc.assert(
      fc.property(fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed'), (s) => {
        const label = getStatusLabel(s);
        expect(label.length).toBeGreaterThan(0);
        expect(label[0]).toBe(label[0].toUpperCase());
      }),
      { numRuns: 100 }
    );
  });

  it('is deterministic (same input -> same output)', () => {
    fc.assert(
      fc.property(fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed'), (s) => {
        expect(getStatusLabel(s)).toBe(getStatusLabel(s));
      }),
      { numRuns: 100 }
    );
  });

  it('produces distinct labels for distinct statuses', () => {
    const labels = (Object.keys(STATUS_LABELS) as Status[]).map(getStatusLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('label helpers - cross-function invariants', () => {
  it('priority and status label spaces do not include leading/trailing whitespace', () => {
    (Object.keys(PRIORITY_LABELS) as Priority[]).forEach(p => {
      const label = getPriorityLabel(p);
      expect(label).toBe(label.trim());
    });
    (Object.keys(STATUS_LABELS) as Status[]).forEach(s => {
      const label = getStatusLabel(s);
      expect(label).toBe(label.trim());
    });
  });
});

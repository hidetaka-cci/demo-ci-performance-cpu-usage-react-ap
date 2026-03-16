/**
 * Property-Based Tests for ticketUtils
 *
 * fast-check の numRuns を上げると CPU 負荷が線形に増加するため、
 * CircleCI のリソースクラス・parallelism 効果を示すデモに最適です。
 *
 * デモ用に numRuns を調整してください:
 *   - 標準: 100 (デフォルト)
 *   - 高負荷: 1000〜10000
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createTicket,
  updateTicketStatus,
  filterTickets,
  sortTickets,
  getTicketStats,
} from '../utils/ticketUtils';
import type { Priority, Status, Ticket } from '../types/ticket';

// ── Arbitraries ───────────────────────────────────────────────────────────────

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

const ticketFormArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ minLength: 1, maxLength: 1000 }),
  priority: priorityArb,
  assignee: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
});

const ticketArb: fc.Arbitrary<Ticket> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ minLength: 1, maxLength: 1000 }),
  priority: priorityArb,
  status: statusArb,
  createdAt: fc.date(),
  updatedAt: fc.date(),
  assignee: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
});

const ticketListArb = fc.array(ticketArb, { maxLength: 50 });

// ── numRuns: CI負荷のコントロールはここで行う ──────────────────────────────────
const NUM_RUNS = 1000;

// ── createTicket properties ───────────────────────────────────────────────────

describe('createTicket', () => {
  it('タイトルは trim されて保存される', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.title).toBe(form.title.trim());
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('説明は trim されて保存される', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.description).toBe(form.description.trim());
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('初期ステータスは常に open', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.status).toBe('open');
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority は入力値と一致する', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.priority).toBe(form.priority);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('ID は TICKET- プレフィックスを持つ', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.id).toMatch(/^TICKET-\d{4,}$/);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('空白のみのタグはフィルタリングされる', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.tags.every(t => t.length > 0)).toBe(true);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('createdAt と updatedAt は同じ値', () => {
    fc.assert(
      fc.property(ticketFormArb, (form) => {
        const ticket = createTicket(form);
        expect(ticket.createdAt.getTime()).toBe(ticket.updatedAt.getTime());
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── updateTicketStatus properties ─────────────────────────────────────────────

describe('updateTicketStatus', () => {
  it('status が更新される', () => {
    fc.assert(
      fc.property(ticketArb, statusArb, (ticket, newStatus) => {
        const updated = updateTicketStatus(ticket, newStatus);
        expect(updated.status).toBe(newStatus);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('status 以外のフィールドは変更されない', () => {
    fc.assert(
      fc.property(ticketArb, statusArb, (ticket, newStatus) => {
        const updated = updateTicketStatus(ticket, newStatus);
        expect(updated.id).toBe(ticket.id);
        expect(updated.title).toBe(ticket.title);
        expect(updated.description).toBe(ticket.description);
        expect(updated.priority).toBe(ticket.priority);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('updatedAt は呼び出し時刻付近の現在時刻になる', () => {
    fc.assert(
      fc.property(ticketArb, statusArb, (ticket, newStatus) => {
        const before = Date.now();
        const updated = updateTicketStatus(ticket, newStatus);
        const after = Date.now();
        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(updated.updatedAt.getTime()).toBeLessThanOrEqual(after);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('元の ticket オブジェクトは変更されない (immutability)', () => {
    fc.assert(
      fc.property(ticketArb, statusArb, (ticket, newStatus) => {
        const originalStatus = ticket.status;
        updateTicketStatus(ticket, newStatus);
        expect(ticket.status).toBe(originalStatus);
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── filterTickets properties ──────────────────────────────────────────────────

describe('filterTickets', () => {
  it('フィルタなしでは全件返す', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const result = filterTickets(tickets, {});
        expect(result).toHaveLength(tickets.length);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('status フィルタ: 結果は全て指定 status に一致する', () => {
    fc.assert(
      fc.property(ticketListArb, statusArb, (tickets, status) => {
        const result = filterTickets(tickets, { status });
        expect(result.every(t => t.status === status)).toBe(true);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority フィルタ: 結果は全て指定 priority に一致する', () => {
    fc.assert(
      fc.property(ticketListArb, priorityArb, (tickets, priority) => {
        const result = filterTickets(tickets, { priority });
        expect(result.every(t => t.priority === priority)).toBe(true);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('フィルタ結果は元のリストのサブセット', () => {
    fc.assert(
      fc.property(ticketListArb, statusArb, (tickets, status) => {
        const result = filterTickets(tickets, { status });
        const ids = new Set(tickets.map(t => t.id));
        expect(result.every(t => ids.has(t.id))).toBe(true);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('search フィルタ: 結果はタイトル・説明・assignee・タグのいずれかに検索語を含む', () => {
    fc.assert(
      fc.property(ticketListArb, fc.string({ minLength: 1, maxLength: 10 }), (tickets, query) => {
        const result = filterTickets(tickets, { search: query });
        const q = query.toLowerCase();
        result.forEach(t => {
          const match =
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.assignee?.toLowerCase().includes(q) ?? false) ||
            t.tags.some(tag => tag.toLowerCase().includes(q));
          expect(match).toBe(true);
        });
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── sortTickets properties ────────────────────────────────────────────────────

describe('sortTickets', () => {
  it('ソート結果の件数は元と同じ', () => {
    fc.assert(
      fc.property(ticketListArb, fc.constantFrom('createdAt', 'priority', 'status' as const), (tickets, sortBy) => {
        const result = sortTickets(tickets, sortBy);
        expect(result).toHaveLength(tickets.length);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('ソートは元のリストを変更しない (immutability)', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const originalIds = tickets.map(t => t.id);
        sortTickets(tickets, 'priority');
        expect(tickets.map(t => t.id)).toEqual(originalIds);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority ソート: critical は high より前', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const result = sortTickets(tickets, 'priority');
        const criticalIndices = result.flatMap((t, i) => t.priority === 'critical' ? [i] : []);
        const highIndices = result.flatMap((t, i) => t.priority === 'high' ? [i] : []);
        if (criticalIndices.length > 0 && highIndices.length > 0) {
          expect(Math.min(...criticalIndices)).toBeLessThan(Math.min(...highIndices));
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── getTicketStats properties ─────────────────────────────────────────────────

describe('getTicketStats', () => {
  it('total は tickets の件数と一致', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const stats = getTicketStats(tickets);
        expect(stats.total).toBe(tickets.length);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('open + inProgress + resolved + closed = total', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const stats = getTicketStats(tickets);
        expect(stats.open + stats.inProgress + stats.resolved + stats.closed).toBe(stats.total);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('critical の件数は total 以下', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const stats = getTicketStats(tickets);
        expect(stats.critical).toBeLessThanOrEqual(stats.total);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('各カウントは非負', () => {
    fc.assert(
      fc.property(ticketListArb, (tickets) => {
        const stats = getTicketStats(tickets);
        expect(stats.open).toBeGreaterThanOrEqual(0);
        expect(stats.inProgress).toBeGreaterThanOrEqual(0);
        expect(stats.resolved).toBeGreaterThanOrEqual(0);
        expect(stats.closed).toBeGreaterThanOrEqual(0);
        expect(stats.critical).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

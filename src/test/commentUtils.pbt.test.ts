/**
 * Property-Based Tests for commentUtils
 *
 * 純粋関数のテスト。DOM を使わないため numRuns を多めに設定し、
 * CPU バウンドなロジックの性質検証に使います。
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createComment,
  addComment,
  getCommentsByTicket,
  sortCommentsByDate,
} from '../utils/commentUtils';
import type { Comment } from '../types/ticket';

// ── Arbitraries ────────────────────────────────────────────────────────────────

const ticketIdArb = fc.stringMatching(/^TICKET-\d{4}$/);

const nonEmptyStr = (max = 100) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

const commentFormDataArb = fc.record({
  author: nonEmptyStr(50),
  body: nonEmptyStr(300),
});

const commentArb: fc.Arbitrary<Comment> = fc.record({
  id: fc.stringMatching(/^COMMENT-\d+$/),
  ticketId: ticketIdArb,
  author: nonEmptyStr(50),
  body: nonEmptyStr(300),
  // fast-check のシュリンク時に NaN 日付が生成されることがあるためフィルタ
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
    .filter(d => !isNaN(d.getTime())),
});

// ── numRuns ────────────────────────────────────────────────────────────────────
const NUM_RUNS = 1000;

// ── createComment ──────────────────────────────────────────────────────────────

describe('createComment', () => {
  it('id は COMMENT- プレフィックスを持つ', () => {
    fc.assert(
      fc.property(ticketIdArb, commentFormDataArb, (ticketId, data) => {
        const comment = createComment(ticketId, data);
        expect(comment.id).toMatch(/^COMMENT-\d+$/);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('ticketId は引数と一致する', () => {
    fc.assert(
      fc.property(ticketIdArb, commentFormDataArb, (ticketId, data) => {
        const comment = createComment(ticketId, data);
        expect(comment.ticketId).toBe(ticketId);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('author は trim された値', () => {
    fc.assert(
      fc.property(ticketIdArb, commentFormDataArb, (ticketId, data) => {
        const comment = createComment(ticketId, data);
        expect(comment.author).toBe(data.author.trim());
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('body は trim された値', () => {
    fc.assert(
      fc.property(ticketIdArb, commentFormDataArb, (ticketId, data) => {
        const comment = createComment(ticketId, data);
        expect(comment.body).toBe(data.body.trim());
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('createdAt は呼び出し時刻付近の現在時刻になる', () => {
    fc.assert(
      fc.property(ticketIdArb, commentFormDataArb, (ticketId, data) => {
        const before = Date.now();
        const comment = createComment(ticketId, data);
        const after = Date.now();
        expect(comment.createdAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(comment.createdAt.getTime()).toBeLessThanOrEqual(after);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('連続して呼び出すと異なる id が生成される', () => {
    fc.assert(
      fc.property(ticketIdArb, commentFormDataArb, (ticketId, data) => {
        const c1 = createComment(ticketId, data);
        const c2 = createComment(ticketId, data);
        expect(c1.id).not.toBe(c2.id);
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── addComment ─────────────────────────────────────────────────────────────────

describe('addComment', () => {
  it('コメントを追加すると件数が1増える', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { maxLength: 20 }), commentArb, (comments, newComment) => {
        const result = addComment(comments, newComment);
        expect(result).toHaveLength(comments.length + 1);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('元の配列は変更されない (immutability)', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { maxLength: 20 }), commentArb, (comments, newComment) => {
        const originalLength = comments.length;
        addComment(comments, newComment);
        expect(comments).toHaveLength(originalLength);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('追加したコメントが結果に含まれる', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { maxLength: 20 }), commentArb, (comments, newComment) => {
        const result = addComment(comments, newComment);
        expect(result).toContainEqual(newComment);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('新しいコメントは末尾に追加される', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { maxLength: 20 }), commentArb, (comments, newComment) => {
        const result = addComment(comments, newComment);
        expect(result[result.length - 1]).toEqual(newComment);
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── getCommentsByTicket ────────────────────────────────────────────────────────

describe('getCommentsByTicket', () => {
  it('対象チケットのコメントだけ返す', () => {
    fc.assert(
      fc.property(
        fc.array(commentArb, { maxLength: 30 }),
        ticketIdArb,
        (comments, targetId) => {
          const result = getCommentsByTicket(comments, targetId);
          expect(result.every(c => c.ticketId === targetId)).toBe(true);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('件数は全コメント数以下', () => {
    fc.assert(
      fc.property(
        fc.array(commentArb, { maxLength: 30 }),
        ticketIdArb,
        (comments, targetId) => {
          const result = getCommentsByTicket(comments, targetId);
          expect(result.length).toBeLessThanOrEqual(comments.length);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('件数は常に非負', () => {
    fc.assert(
      fc.property(
        fc.array(commentArb, { maxLength: 30 }),
        ticketIdArb,
        (comments, targetId) => {
          const result = getCommentsByTicket(comments, targetId);
          expect(result.length).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('ticketId が一致するコメントは全て含まれる', () => {
    fc.assert(
      fc.property(
        fc.array(commentArb, { maxLength: 30 }),
        ticketIdArb,
        (comments, targetId) => {
          const expected = comments.filter(c => c.ticketId === targetId).length;
          const result = getCommentsByTicket(comments, targetId);
          expect(result.length).toBe(expected);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── sortCommentsByDate ─────────────────────────────────────────────────────────

describe('sortCommentsByDate', () => {
  it('件数は変わらない', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { maxLength: 20 }), (comments) => {
        const result = sortCommentsByDate(comments);
        expect(result).toHaveLength(comments.length);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('元の配列は変更されない (immutability)', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { maxLength: 20 }), (comments) => {
        const copy = [...comments];
        sortCommentsByDate(comments);
        expect(comments).toEqual(copy);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('createdAt の昇順（古い順）にソートされる', () => {
    fc.assert(
      fc.property(fc.array(commentArb, { minLength: 2, maxLength: 20 }), (comments) => {
        const result = sortCommentsByDate(comments);
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].createdAt.getTime()).toBeLessThanOrEqual(
            result[i].createdAt.getTime()
          );
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

import { describe, expect, it } from 'vitest';
import {
  roleHasCapability,
  roleIsCampusScoped,
  ARTICLE_TRANSITIONS,
} from '../src/index';

describe('capabilities', () => {
  it('blocks journalists from publishing', () => {
    expect(roleHasCapability('JOURNALIST', 'editorial.publish')).toBe(false);
    expect(roleHasCapability('CAMPUS_CORRESPONDENT', 'editorial.publish')).toBe(false);
    expect(roleHasCapability('EDITOR', 'editorial.publish')).toBe(true);
  });

  it('scopes field roles', () => {
    expect(roleIsCampusScoped('JOURNALIST')).toBe(true);
    expect(roleIsCampusScoped('CAMPUS_CORRESPONDENT')).toBe(true);
    expect(roleIsCampusScoped('EDITOR')).toBe(false);
  });

  it('keeps commercial out of editorial publish', () => {
    expect(roleHasCapability('COMMERCIAL_MANAGER', 'editorial.publish')).toBe(false);
    expect(roleHasCapability('COMMERCIAL_MANAGER', 'campaign.manage')).toBe(true);
  });

  it('requires escalate for high-risk path via EIC capability', () => {
    expect(roleHasCapability('EDITOR', 'editorial.escalate')).toBe(false);
    expect(roleHasCapability('EDITOR_IN_CHIEF', 'editorial.escalate')).toBe(true);
  });

  it('defines READY → PUBLISHED as editorial.publish', () => {
    expect(ARTICLE_TRANSITIONS.READY.PUBLISHED).toBe('editorial.publish');
  });
});

import { describe, it, expect } from 'vitest';
import { checkIsAdmin, hasSiteAdminGroup } from './isAdmin';

describe('hasSiteAdminGroup', () => {
  it('is true for a member of site-admins (group objects)', () => {
    expect(hasSiteAdminGroup({ userUuid: 'u1', groups: [{ key: 'tenant_admin' }, { key: 'site-admins' }] })).toBe(true);
  });
  it('is true for a member of site-admins (bare keys)', () => {
    expect(hasSiteAdminGroup({ userUuid: 'u1', groups: ['site-admins'] })).toBe(true);
  });
  it('ignores team-administrators and other groups', () => {
    expect(hasSiteAdminGroup({ userUuid: 'u1', groups: [{ key: 'team-administrators' }, 'admin'] })).toBe(false);
  });
  it('is false with no user, no uuid or no groups', () => {
    expect(hasSiteAdminGroup(null)).toBe(false);
    expect(hasSiteAdminGroup({ groups: ['site-admins'] })).toBe(false);
    expect(hasSiteAdminGroup({ userUuid: 'u1' })).toBe(false);
  });
  it('does not trust a profile role field', () => {
    expect(hasSiteAdminGroup({ userUuid: 'u1', role: 'admin' } as never)).toBe(false);
  });
});

describe('checkIsAdmin', () => {
  it('resolves to the group check', async () => {
    await expect(checkIsAdmin({ userUuid: 'u1', groups: [{ key: 'site-admins' }] })).resolves.toBe(true);
    await expect(checkIsAdmin({ userUuid: 'u1', groups: [] })).resolves.toBe(false);
  });
});

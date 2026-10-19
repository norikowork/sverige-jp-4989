// 管理者判定は Kliv のグループ site-admins で行う。user_profiles.role は本人が書き換えられるため使わない。
// これは表示の切り替え用で、実際の権限チェックはエッジ関数 manage-user-action が行う。
export const SITE_ADMIN_GROUP = 'site-admins';

type UserWithGroups = { userUuid?: string; groups?: Array<string | { key?: string }> } | null | undefined;

export function hasSiteAdminGroup(user: UserWithGroups): boolean {
  if (!user?.userUuid) return false;
  return (user.groups ?? []).some((g) => (typeof g === 'string' ? g : g?.key) === SITE_ADMIN_GROUP);
}

export async function checkIsAdmin(user: UserWithGroups): Promise<boolean> {
  return hasSiteAdminGroup(user);
}

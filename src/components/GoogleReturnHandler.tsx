import { useEffect } from 'react';
import auth from '@/lib/shared/kliv-auth';
import db from '@/lib/shared/kliv-database';

export const GOOGLE_FLAG = 'sverige_google_login_pending';

// Googleログインから戻ってきた直後に、user_profiles / member_contacts を作成する
const GoogleReturnHandler = () => {
  useEffect(() => {
    if (sessionStorage.getItem(GOOGLE_FLAG) !== '1') return;
    sessionStorage.removeItem(GOOGLE_FLAG);
    (async () => {
      try {
        const user: any = await auth.getUser(true);
        if (!user) return;
        const existing = await db.query('user_profiles', {
          user_uuid: `eq.${user.userUuid}`,
          _deleted: 'eq.0',
        });
        if (existing.length === 0) {
          const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
          await db.insert('user_profiles', { user_uuid: user.userUuid, display_name: displayName });
        }
        if (user.email) {
          const contacts = await db.query('member_contacts', { _created_by: `eq.${user.userUuid}` });
          if (contacts.length === 0) {
            await db.insert('member_contacts', { email: user.email });
          } else if (contacts[0].email !== user.email) {
            await db.update('member_contacts', { _row_id: `eq.${contacts[0]._row_id}` }, { email: user.email });
          }
        }
        window.dispatchEvent(new Event('focus'));
      } catch (err) {
        console.error('Google login profile error:', err);
      }
    })();
  }, []);
  return null;
};

export default GoogleReturnHandler;

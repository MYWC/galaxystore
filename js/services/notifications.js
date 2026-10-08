/* ============================================
   NOTIFICATIONS SERVICE
   Supabase Notifications + Local Fallback
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_NOTIFS_KEY = 'ms_notifications';

/* ============================================
   LOCAL STORAGE
   ============================================ */

function getLocalNotifications() {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list) {
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch (e) {
    console.error('Save notifications error:', e);
  }
}

/* ============================================
   MAPPER
   ============================================ */

function mapSupabaseNotification(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || 'system',
    icon: row.icon || row.type || 'system',
    title: row.title || '',
    text: row.text || '',
    link: row.link || '',
    read: row.read === true,
    time: row.created_at,
    createdAt: row.created_at,
  };
}

/* ============================================
   SEED (نمونه اولیه برای کاربر جدید)
   ============================================ */

function getDemoNotifications() {
  const now = Date.now();

  return [
    {
      id: 'demo-n1',
      type: 'order',
      icon: 'order',
      title: 'سفارش شما ارسال شد 🚚',
      text: 'سفارش <strong>MS-' + (12345000 + Math.floor(Math.random() * 999)) + '</strong> تحویل پست شد. کد رهگیری برای شما پیامک می‌شود.',
      time: new Date(now - 5 * 60 * 1000).toISOString(),
      read: false,
      link: 'account/orders.html',
    },
    {
      id: 'demo-n2',
      type: 'offer',
      icon: 'offer',
      title: 'تخفیف ۲۵٪ روی لوازم جانبی',
      text: 'تا پایان هفته روی تمام لوازم جانبی <strong>۲۵٪ تخفیف</strong> ویژه در نظر گرفته شده. فرصت را از دست ندهید!',
      time: new Date(now - 45 * 60 * 1000).toISOString(),
      read: false,
      link: 'category.html?filter=discount',
    },
    {
      id: 'demo-n3',
      type: 'system',
      icon: 'system',
      title: 'ورود موفق به حساب کاربری',
      text: 'ورود جدیدی به حساب شما انجام شد. اگر شما نبودید، رمز عبور خود را تغییر دهید.',
      time: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'account/profile.html',
    },
    {
      id: 'demo-n4',
      type: 'order',
      icon: 'success',
      title: 'سفارش شما تأیید شد ✅',
      text: 'سفارش شما بررسی و تأیید شد. به‌زودی بسته‌بندی و ارسال می‌شود.',
      time: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'account/orders.html',
    },
    {
      id: 'demo-n5',
      type: 'offer',
      icon: 'warning',
      title: 'پیشنهاد ویژه Flash Sale',
      text: 'فروش فلش با تخفیف‌های تا <strong>۳۰٪</strong> آغاز شد. فقط تا پایان امروز!',
      time: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'index.html#flash-sale',
    },
    {
      id: 'demo-n6',
      type: 'system',
      icon: 'system',
      title: 'به موبایل استور خوش آمدید 🎉',
      text: 'حساب کاربری شما با موفقیت ساخته شد. از خرید با ما لذت ببرید.',
      time: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'index.html',
    },
  ];
}

/* ============================================
   GET NOTIFICATIONS
   ============================================ */

/**
 * گرفتن همه اعلان‌های کاربر جاری
 */
export async function getNotifications() {
  const user = await getCurrentUser();

  // اگه کاربر لاگین نیست، از local استفاده کن
  if (!user) {
    return getLocalNotifications();
  }

  // اگه Supabase هست
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        const mapped = data.map(mapSupabaseNotification).filter(Boolean);

        // اگه کاربر لاگین داره ولی اعلان توی Supabase نداره،
        // از demo استفاده کن و در Supabase insert کن
        if (mapped.length === 0) {
          const demos = getDemoNotifications();
          await seedNotificationsToSupabase(user.id, demos);
          return demos;
        }

        return mapped;
      }
    } catch (err) {
      console.error('Fetch notifications exception:', err);
    }
  }

  // Fallback
  const local = getLocalNotifications();

  // اگه خالی بود، demo بذار
  if (local.length === 0) {
    const demos = getDemoNotifications();
    saveLocalNotifications(demos);
    return demos;
  }

  return local;
}

/* ============================================
   SEED TO SUPABASE
   ============================================ */

async function seedNotificationsToSupabase(userId, demos) {
  try {
    const payload = demos.map((d) => ({
      user_id: userId,
      type: d.type,
      icon: d.icon,
      title: d.title,
      text: d.text,
      link: d.link,
      read: d.read,
      created_at: d.time,
    }));

    await supabase.from('notifications').insert(payload);

    console.log(
      `%c✓ Seeded ${payload.length} notifications to Supabase`,
      'color:#18B981;font-weight:bold;'
    );
  } catch (err) {
    console.error('Seed notifications error:', err);
  }
}

/* ============================================
   MARK AS READ
   ============================================ */

export async function markNotificationRead(id) {
  const user = await getCurrentUser();

  // Local update
  const local = getLocalNotifications();
  const idx = local.findIndex((n) => n.id === id);
  if (idx !== -1) {
    local[idx].read = true;
    saveLocalNotifications(local);
  }

  // Supabase update
  if (user && isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Mark read error:', error);
      }
    } catch (err) {
      console.error('Mark read exception:', err);
    }
  }

  return { success: true };
}

/* ============================================
   MARK ALL AS READ
   ============================================ */

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();

  // Local update
  const local = getLocalNotifications();
  local.forEach((n) => { n.read = true; });
  saveLocalNotifications(local);

  // Supabase update
  if (user && isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Mark all read error:', error);
      }
    } catch (err) {
      console.error('Mark all read exception:', err);
    }
  }

  return { success: true };
}

/* ============================================
   ADD NOTIFICATION (internal)
   ============================================ */

export async function addNotification({ userId, type, icon, title, text, link = '' }) {
  const user = await getCurrentUser();
  const targetUserId = userId || user?.id;

  if (!targetUserId) {
    return { error: { message: 'کاربر یافت نشد' } };
  }

  const now = new Date().toISOString();

  const localNotif = {
    id: 'notif-' + Date.now(),
    userId: targetUserId,
    type,
    icon,
    title,
    text,
    link,
    read: false,
    time: now,
    createdAt: now,
  };

  // Local
  const list = getLocalNotifications();
  list.unshift(localNotif);
  saveLocalNotifications(list);

  // Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type,
          icon,
          title,
          text,
          link,
          read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Add notification error:', error);
        return { notification: localNotif, saved: 'local' };
      }

      return {
        notification: mapSupabaseNotification(data),
        saved: 'supabase',
      };
    } catch (err) {
      console.error('Add notification exception:', err);
      return { notification: localNotif, saved: 'local' };
    }
  }

  return { notification: localNotif, saved: 'local' };
}

/* ============================================
   UNREAD COUNT
   ============================================ */

export async function getUnreadCount() {
  const list = await getNotifications();
  return list.filter((n) => !n.read).length;
}
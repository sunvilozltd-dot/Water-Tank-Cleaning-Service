import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'editor';

export interface AdminUserRecord {
  id: string;
  email: string;
  role: AdminRole;
  name?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Primary authorized owner emails that auto-bootstrap to super_admin once authenticated by Supabase
const PRIMARY_OWNER_EMAILS = [
  'sunvilozltd@gmail.com',
  'sunvilozcleancare@gmail.com'
];

/**
 * Verify whether an authenticated Supabase user has an active admin record
 * and fetch their designated role.
 */
export async function fetchAdminProfile(
  userId: string,
  userEmail?: string
): Promise<{ name: string; email: string; role: string } | null> {
  if (!isSupabaseConfigured() || (!userId && !userEmail)) {
    return null;
  }

  const normalizedEmail = (userEmail || '').trim().toLowerCase();
  const isPrimaryOwner = PRIMARY_OWNER_EMAILS.includes(normalizedEmail);

  try {
    let adminRecord: any = null;

    // 1. Try querying admin_users by UUID first
    if (userId) {
      const { data: byId } = await supabase
        .from('admin_users')
        .select('id, email, role, name, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (byId) {
        adminRecord = byId;
      }
    }

    // 2. If not matched by UUID, try querying by email (case-insensitive)
    if (!adminRecord && normalizedEmail) {
      const { data: byEmail } = await supabase
        .from('admin_users')
        .select('id, email, role, name, is_active')
        .ilike('email', normalizedEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (byEmail) {
        adminRecord = byEmail;
        // Sync the auth user UUID if it differed
        if (userId && byEmail.id !== userId) {
          try {
            await supabase
              .from('admin_users')
              .update({ id: userId, updated_at: new Date().toISOString() })
              .eq('email', byEmail.email);
          } catch {
            // Ignore background sync error
          }
        }
      }
    }

    // 3. If found in database, return verified role
    if (adminRecord && adminRecord.is_active) {
      return {
        name: adminRecord.name || normalizedEmail.split('@')[0] || 'Administrator',
        email: adminRecord.email,
        role: adminRecord.role || (isPrimaryOwner ? 'super_admin' : 'admin')
      };
    }

    // 4. Primary Owner Safety Net:
    // If the user successfully authenticated with Supabase Auth using the designated owner email,
    // automatically provision their record into admin_users so they are never locked out.
    if (isPrimaryOwner) {
      try {
        await supabase
          .from('admin_users')
          .upsert({
            id: userId,
            email: normalizedEmail,
            role: 'super_admin',
            name: 'Sunviloz Super Admin',
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });
      } catch (upsertErr) {
        console.warn('[AdminUserService] Primary owner upsert notice:', upsertErr);
      }

      return {
        name: 'Sunviloz Super Admin',
        email: normalizedEmail,
        role: 'super_admin'
      };
    }

    // Not an admin
    return null;
  } catch (err: any) {
    console.error('[AdminUserService] Unexpected error during role verification:', err);
    // If network or database error, but user is authenticated as the designated owner:
    if (isPrimaryOwner) {
      return {
        name: 'Sunviloz Super Admin',
        email: normalizedEmail,
        role: 'super_admin'
      };
    }
    return null;
  }
}

/**
 * Get all configured admin users (Super Admin only)
 */
export async function getAdminUsersList(): Promise<AdminUserRecord[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[AdminUserService] Failed to list admin users:', error?.message);
      // Return default owner row if table not populated yet
      return [
        {
          id: 'primary-owner',
          email: 'sunvilozltd@gmail.com',
          role: 'super_admin',
          name: 'Sunviloz Super Admin',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
    }

    return data.map((d: any) => ({
      id: d.id,
      email: d.email,
      role: (d.role as AdminRole) || 'admin',
      name: d.name || '',
      isActive: Boolean(d.is_active),
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  } catch (err) {
    console.error('[AdminUserService] Exception fetching admin users:', err);
    return [];
  }
}

/**
 * Update an admin's role or active status
 */
export async function updateAdminUserStatus(
  userId: string,
  role: AdminRole,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .update({
        role,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update admin role' };
  }
}

/**
 * Remove an admin user's access
 */
export async function removeAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove admin' };
  }
}

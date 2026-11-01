import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  ShieldAlert, 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Info,
  Trash2,
  Lock
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  AdminUserRecord, 
  AdminRole, 
  getAdminUsersList, 
  updateAdminUserStatus, 
  removeAdminUser 
} from '../../services/adminUserService';
import { recordAuditLog } from '../../services/auditService';

export const AdminUsersTab: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);

  const isSuperAdmin = adminUser?.role === 'super_admin';

  const loadUsers = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const list = await getAdminUsersList();
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: AdminRole, currentStatus: boolean) => {
    if (!isSuperAdmin) {
      setFeedback({ type: 'error', message: 'শুধুমাত্র Super Admin রোল পরিবর্তন করতে পারবেন।' });
      return;
    }

    const res = await updateAdminUserStatus(userId, newRole, currentStatus);
    if (res.success) {
      setFeedback({ type: 'success', message: 'অ্যাডমিন রোল সফলভাবে আপডেট করা হয়েছে।' });
      await recordAuditLog(
        adminUser?.email || 'Admin',
        'Updated Admin Role',
        'AdminUser',
        userId,
        `Changed role to ${newRole}`
      );
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'আপডেট করতে ব্যর্থ হয়েছে।' });
    }
  };

  const handleToggleStatus = async (userId: string, currentRole: AdminRole, currentStatus: boolean) => {
    if (!isSuperAdmin) {
      setFeedback({ type: 'error', message: 'শুধুমাত্র Super Admin স্ট্যাটাস পরিবর্তন করতে পারবেন।' });
      return;
    }

    const newStatus = !currentStatus;
    const res = await updateAdminUserStatus(userId, currentRole, newStatus);
    if (res.success) {
      setFeedback({ 
        type: 'success', 
        message: newStatus ? 'অ্যাডমিন অ্যাকাউন্ট সক্রিয় করা হয়েছে।' : 'অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।' 
      });
      await recordAuditLog(
        adminUser?.email || 'Admin',
        newStatus ? 'Activated Admin User' : 'Deactivated Admin User',
        'AdminUser',
        userId
      );
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।' });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!isSuperAdmin) {
      setFeedback({ type: 'error', message: 'শুধুমাত্র Super Admin অ্যাডমিন মুছতে পারবেন।' });
      return;
    }

    if (!window.confirm(`আপনি কি নিশ্চিত যে ${userEmail}-এর অ্যাডমিন সুবিধা মুছে ফেলতে চান?`)) {
      return;
    }

    const res = await removeAdminUser(userId);
    if (res.success) {
      setFeedback({ type: 'success', message: 'অ্যাডমিন তালিকা থেকে মুছে ফেলা হয়েছে।' });
      await recordAuditLog(
        adminUser?.email || 'Admin',
        'Removed Admin User',
        'AdminUser',
        userId,
        userEmail
      );
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'মুছতে ব্যর্থ হয়েছে।' });
    }
  };

  const sqlSnippet = `-- নতুন অ্যাডমিন তৈরি করার জন্য নিচের কোডটি Supabase SQL Editor-এ রান করুন:
-- ১. প্রথমে Supabase Dashboard -> Authentication -> Users এ গিয়ে "Add user" দিয়ে ইউজার তৈরি করুন।
-- ২. এরপর তৈরি করা ইউজারের User UID কপি করে নিচের কোডে বসিয়ে রান করুন:

INSERT INTO public.admin_users (id, email, role, name, is_active)
VALUES (
  'PASTE_USER_UUID_HERE', -- Supabase Authentication থেকে প্রাপ্ত UID
  'admin@example.com',    -- ইউজারের ইমেইল
  'admin',               -- রোল: 'super_admin' অথবা 'admin' অথবা 'manager'
  'Admin Name',          -- ইউজারের নাম
  true                   -- সক্রিয় স্ট্যাটাস
)
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>অ্যাডমিন রোল ও পারমিশন ব্যবস্থাপনা (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            শুধুমাত্র অনুমোদিত ইমেইল এবং রোলপ্রাপ্ত ইউজাররা অ্যাডমিন প্যানেলে লগইন করতে পারবেন। কোনো বহিরাগত ব্যক্তি লগইন করতে পারবে না।
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
            : 'bg-red-950/60 border-red-800 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Security Status Box */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <Lock className="w-4 h-4" />
          <span>ক্রিপ্টোগ্রাফিক রোল-বেসড সিকিউরিটি সক্রিয় আছে</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          আপনার ওয়েবসাইটটিতে সোর্স কোডভিত্তিক কোনো হার্ডকোডেড ক্রেডেনশিয়াল নেই। প্রতিটি লগইন সরাসরি Supabase-এর এনক্রিপ্টেড ডাটাবেজ এবং <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300 font-mono">public.admin_users</code> টেবিলের মাধ্যমে যাচাই করা হয়। কোনো ইউজারের নাম তালিকায় না থাকলে সে পাসওয়ার্ড জানলেও প্রবেশ করতে পারবে না।
        </p>
      </div>

      {/* Admin Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Users className="w-4 h-4 text-blue-400" />
            <span>অনুমোদিত অ্যাডমিনদের তালিকা ({users.length})</span>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
            আপনার রোল: <strong className="text-emerald-400 uppercase">{adminUser?.role || 'Admin'}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>অ্যাডমিন তালিকা লোড হচ্ছে...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">এখনও কোনো অ্যাডমিন এন্ট্রি করা হয়নি</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              আপনার Supabase ডাটাবেজের <code className="text-blue-300 font-mono">admin_users</code> টেবিলে আপনার ইউজার আইডি যোগ করুন। নিচের নির্দেশিকা দেখুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">অ্যাডমিনের নাম ও ইমেইল</th>
                  <th className="py-3 px-4">রোল (Role)</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4">যুক্ত হওয়ার তারিখ</th>
                  {isSuperAdmin && <th className="py-3 px-4 text-right">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{u.name || 'Admin User'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as AdminRole, u.isActive)}
                          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 font-semibold"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="editor">Editor</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          u.role === 'super_admin' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয়
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> নিষ্ক্রিয়
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u.id, u.role, u.isActive)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                            u.isActive 
                              ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60' 
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guide Box for Adding New Admins */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Key className="w-4 h-4 text-amber-400" />
            <span>নতুন অ্যাডমিন কীভাবে তৈরি করবেন (How to Add an Admin)</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedQuery ? 'কপি হয়েছে!' : 'SQL কোড কপি করুন'}</span>
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-white">ধাপ ১: Supabase-এ ইউজার অ্যাকাউন্ট তৈরি করুন</p>
          <p className="text-slate-400">
            আপনার <strong>Supabase Dashboard</strong> &gt; <strong>Authentication</strong> &gt; <strong>Users</strong>-এ গিয়ে <strong>"Add user"</strong> &gt; <strong>"Create user"</strong>-এ ক্লিক করে যে ইমেইল ও পাসওয়ার্ড দিতে চান তা দিয়ে তৈরি করুন। এবং তৈরি হওয়া ইউজারের <strong>User UID</strong> কপি করুন।
          </p>

          <p className="font-semibold text-white pt-2">ধাপ ২: অ্যাডমিন টেবিলে এন্ট্রি দিন</p>
          <p className="text-slate-400">
            Supabase-এর <strong>SQL Editor</strong>-এ গিয়ে নিচের কোডটি পেস্ট করে <code className="text-amber-300 font-mono">PASTE_USER_UUID_HERE</code>-এর জায়গায় সেই কপি করা ইউজার আইডিটি দিয়ে <strong>Run</strong> করুন:
          </p>

          <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre">
            {sqlSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};

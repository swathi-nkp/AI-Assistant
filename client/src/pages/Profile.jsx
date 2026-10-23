import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
  FileText,
  HelpCircle,
  LogOut,
  Save,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, logout, updateUserData } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ chatCount: 0, summaryCount: 0, quizCount: 0 });
  const [loading, setLoading] = useState(true);

  // Name form state
  const [name, setName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      if (res.data?.success) {
        setProfileData(res.data.user);
        setName(res.data.user.name || '');
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }

    try {
      setNameLoading(true);
      setNameError('');
      setNameSuccess('');
      const res = await userAPI.updateProfile({ name: name.trim() });
      if (res.data?.success) {
        setNameSuccess('Name updated successfully!');
        updateUserData({ name: res.data.user.name });
      }
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword) {
      setPasswordError('Please provide both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      const res = await userAPI.updatePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <UserIcon className="w-4 h-4" />
            <span>Account Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Student Profile & Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal credentials, study analytics, and security settings
          </p>
        </div>

        {/* User Card & Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-100">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="danger" size="sm" onClick={logout} icon={LogOut}>
              Sign Out
            </Button>
          </div>

          {/* Aggregated Study Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
              <p className="text-2xl font-extrabold text-indigo-700">{stats.chatCount}</p>
              <p className="text-xs font-semibold text-indigo-900 mt-0.5">AI Chats</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <p className="text-2xl font-extrabold text-emerald-700">{stats.summaryCount}</p>
              <p className="text-xs font-semibold text-emerald-900 mt-0.5">Summaries</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/80">
              <p className="text-2xl font-extrabold text-purple-700">{stats.quizCount}</p>
              <p className="text-xs font-semibold text-purple-900 mt-0.5">Quizzes</p>
            </div>
          </div>
        </div>

        {/* Edit Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form 1: Update Name */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-600" />
              <span>Update Full Name</span>
            </h3>

            {nameSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{nameSuccess}</span>
              </div>
            )}
            {nameError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{nameError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={nameLoading}
                icon={Save}
                className="w-full"
              >
                Save Name Changes
              </Button>
            </form>
          </div>

          {/* Form 2: Update Password */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Change Password</span>
            </h3>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                  }
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={passwordLoading}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

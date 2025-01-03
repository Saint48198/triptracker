'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

type Role = { id: number; name: string };
type User = { id?: number; username: string; roles: string[] };

const ManageUserPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<User>({ username: '', roles: [] });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const userId = router.query.id as string;

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      setRoles(data.roles);
    };

    const fetchUser = async () => {
      if (!userId) return;

      const res = await fetch(`/api/admin/user?id=${userId}`);
      const data = await res.json();
      setUser({ username: data.username, roles: data.roles });
    };

    fetchRoles();
    if (userId) fetchUser();
  }, [userId]);

  const handleRoleChange = (role: string) => {
    setUser((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/manage-user', {
        method: userId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, id: userId }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setSuccess(
        userId ? 'User updated successfully!' : 'User created successfully!'
      );
      setTimeout(() => router.push('/admin/users'), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">
        {userId ? 'Update User' : 'Create User'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700">Roles</p>
          <div className="mt-2 space-y-2">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={user.roles.includes(role.name)}
                  onChange={() => handleRoleChange(role.name)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{role.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {userId ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageUserPage;

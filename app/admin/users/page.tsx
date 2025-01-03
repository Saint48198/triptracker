'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { User, Role } from '@/types/UserTypes';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<{
    id: number | null;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    roles: string[];
  }>({
    id: null,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['user'],
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await axios.get('/api/roles');
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const validatePassword = (
    password: string,
    confirmPassword: string
  ): string | null => {
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    if (password.length < 12) {
      return 'Password must be at least 12 characters long.';
    }
    if (!/[a-zA-Z0-9]/.test(password)) {
      return 'Password must include at least one alphanumeric character.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must include at least one special character.';
    }
    return null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword(
      formData.password,
      formData.confirmPassword
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(formData.password, 10); // Hash the password

      const roleIds = formData.roles.map((roleName) => {
        const role = roles.find((r) => r.name === roleName);
        return role?.id; // Retrieve the role ID corresponding to the role name
      });

      if (!roleIds || roleIds.includes(undefined)) {
        throw new Error('Invalid role selection');
      }

      if (formData.id) {
        await axios.put(`/api/users/${formData.id}`, {
          ...formData,
          roles: roleIds,
        });
      } else {
        const { password, confirmPassword, ...rest } = formData;
        await axios.post('/api/users', {
          ...rest,
          passwordHash,
          roles: roleIds,
        });
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roles: ['user'],
    });
    setError(null);
    setFormVisible(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            resetForm();
            setFormVisible(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>
      {formVisible && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-gray-100 p-4 mt-4 rounded shadow"
        >
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          {!formData.id && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label
              htmlFor="roles"
              className="block text-sm font-medium text-gray-700"
            >
              Roles
            </label>
            <div className="flex space-x-2">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="inline-flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.name)}
                    value={role.id}
                    onChange={(e) => {
                      const updatedRoles = e.target.checked
                        ? [...formData.roles, role.name]
                        : formData.roles.filter((r) => r !== role.name);
                      setFormData({ ...formData, roles: updatedRoles });
                    }}
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Save User
          </button>
        </form>
      )}
      {users.length === 0 ? (
        <p className="mt-6 text-gray-500 text-center">No users available.</p>
      ) : (
        <table className="table-auto w-full mt-6 bg-white shadow rounded">
          <thead>
            <tr>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Roles</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.roles}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => {
                      setFormData({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        password: '',
                        confirmPassword: '',
                        roles: user.roles.map((role: Role) => role.name),
                      });
                      setFormVisible(true);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersPage;

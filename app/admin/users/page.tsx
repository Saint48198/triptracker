'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<{
    id: number | null;
    username: string;
    email: string;
    password: string;
    roles: string[];
  }>({
    id: null,
    username: '',
    email: '',
    password: '',
    roles: ['user'],
  });
  const [roles, setRoles] = useState<Role[]>([]);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`/api/users/${formData.id}`, formData);
      } else {
        const { password, ...rest } = formData;
        await axios.post('/api/users', { ...rest, password });
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      username: '',
      email: '',
      password: '',
      roles: ['user'],
    });
    setFormVisible(false);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      password: '',
      roles: user.roles.map((role) => role.name),
    });
    setFormVisible(true);
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {formVisible ? 'Cancel' : 'Add User'}
        </button>
      </div>
      {formVisible && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-gray-100 p-4 mt-4 rounded shadow"
        >
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
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Roles
            </label>
            {roles.map((role) => (
              <div key={role.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  value={role.name}
                  checked={formData.roles.includes(role.name)}
                  onChange={() => handleRoleChange(role.name)}
                  disabled={role.name === 'user'}
                  className="mr-2"
                />
                <label htmlFor={`role-${role.id}`}>{role.name}</label>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Save User
          </button>
        </form>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul className="bg-white shadow rounded divide-y">
          {users.map((user) => (
            <li key={user.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">
                  Roles: {user.roles.map((role) => role.name).join(', ')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UsersPage;

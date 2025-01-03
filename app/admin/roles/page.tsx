'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Role } from '@/types/UserTypes';

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<{ id: null | number; name: string }>(
    {
      id: null,
      name: '',
    }
  );

  useEffect(() => {
    fetchRoles();
  }, []);

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
        await axios.put(`/api/roles/${formData.id}`, { name: formData.name });
      } else {
        await axios.post('/api/roles', { name: formData.name });
      }
      fetchRoles();
      resetForm();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`/api/roles/${id}`);
        fetchRoles();
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '' });
    setFormVisible(false);
  };

  const handleEditRole = (role: Role) => {
    setFormData({ id: role.id, name: role.name });
    setFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {formVisible ? 'Cancel' : 'Add Role'}
        </button>
      </div>
      {formVisible && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-gray-100 p-4 mt-4 rounded shadow"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Role Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Save Role
          </button>
        </form>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Roles</h2>
        {roles.length === 0 ? (
          <p className="text-gray-500">No roles available.</p>
        ) : (
          <ul className="bg-white shadow rounded divide-y">
            {roles.map((role) => (
              <li
                key={role.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{role.name}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RolesPage;

'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Role } from '@/types/UserTypes';
import Button from '@/components/Button/Button';
import styles from './RolesPage.module.scss';
import FormInput from '@/components/FormInput/FormInput';

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<{ id: null | number; name: string }>(
    {
      id: null,
      name: '',
    }
  );

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/roles');
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`/api/roles/${formData.id}`, { name: formData.name });
      } else {
        await axios.post('/api/roles', { name: formData.name });
      }
      await fetchRoles();
      resetForm();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`/api/roles/${id}`);
        await fetchRoles();
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

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Role Management</h1>
        <Button
          buttonType={'button'}
          styleType={'secondary'}
          onClick={() => setFormVisible(!formVisible)}
        >
          {formVisible ? 'Cancel' : 'Add Role'}
        </Button>
      </div>
      {formVisible && (
        <form onSubmit={handleFormSubmit} className={styles.form}>
          <FormInput
            label={'Role Name'}
            id={'name'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Button buttonType={'submit'} styleType={'secondary'}>
            Save Role
          </Button>
        </form>
      )}
      <div className={styles.rolesList}>
        <h2 className={styles.rolesListTitle}>Roles</h2>
        {roles.length === 0 ? (
          <p className={styles.noRolesAvailable}>No roles available.</p>
        ) : (
          <ul className={styles.rolesListContainer}>
            {roles.map((role) => (
              <li key={role.id} className={styles.rolesListItem}>
                <div>
                  <p className={styles.roleName}>{role.name}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    buttonType={'button'}
                    styleType={'text'}
                    onClick={() => handleEditRole(role)}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button
                    buttonType={'button'}
                    styleType={'danger'}
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    Delete
                  </Button>
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

'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { User, Role } from '@/types/UserTypes';
import Message from '@/components/Message/Message';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { validatePassword } from '@/utils/validatePassword';
import PasswordChangeDialog from '@/components/PasswordChangeDialog/PasswordChangeDialog';
import ConfirmAction from '@/components/ConfirmAction/ConfirmAction';
import styles from './UsersPage.module.scss';
import Button from '@/components/Button/Button';
import DataTable from '@/components/DataTable/DataTable';
import { Column } from '@/components/DataTable/DataTable.types';
import FormInput from '@/components/FormInput/FormInput';
import FormCheckbox from '@/components/FormCheckbox/FormCheckbox';

function UsersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams ? searchParams.get('uid') : null;
  const queryMessage = searchParams ? searchParams.get('message') : null;
  const queryMessageType = (searchParams ? searchParams.get('type') : '') as
    | ''
    | 'error'
    | 'success'
    | (() => '' | 'error' | 'success');
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<{
    id: number | null;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    roles: string[];
    googleAccessToken: string;
    googleRefreshToken: string;
    googleTokenExpiry: number;
  }>({
    id: null,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['user'],
    googleAccessToken: '',
    googleRefreshToken: '',
    googleTokenExpiry: 0,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState(queryMessage || '');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>(
    queryMessageType || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const columns: Column[] = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'roles', label: 'Roles' },
  ];

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/users');
      const usersArray: User[] = data.map((user: any) => ({
        ...user,
        roles: Array.isArray(user.roles) ? user.roles.split(',') : user.roles,
      }));
      setUsers(usersArray);
    } catch (error) {
      setMessage('Failed to fetch users');
      setMessageType('error');
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/roles');
      setRoles(data);
    } catch (error) {
      setMessage('Failed to fetch roles');
      setMessageType('error');
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  const fetchUserById = useCallback(async (id: string) => {
    try {
      const { data } = await axios.get(`/api/users/${id}`);
      setFormData({
        id: data.id,
        username: data.username,
        email: data.email,
        password: '',
        confirmPassword: '',
        roles: Array.isArray(data.roles) ? data.roles.split(',') : data.roles,
        googleAccessToken: data.google_access_token,
        googleRefreshToken: data.google_refresh_token,
        googleTokenExpiry: data.google_token_expiry,
      });
      setFormVisible(true);
    } catch (error) {
      setMessage('Failed to fetch user');
      setMessageType('error');
      console.error('Failed to fetch user:', error);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword(
      formData.password,
      formData.confirmPassword
    );
    if (validationError) {
      setMessage(validationError);
      setMessageType('error');
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(formData.password, 10);

      const roleIds = formData.roles.map((roleName: string) => {
        const role = roles.find((r) => r.name === roleName);
        return role?.id;
      });

      if (!roleIds || roleIds.includes(undefined)) {
        setMessage('Invalid role selection');
        console.error('Invalid role selection');
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
      await fetchUsers();
      resetForm();
      removeQueryParams();
    } catch (error) {
      setMessage('Failed to save user');
      setMessageType('error');
      console.error('Failed to save user:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setDeleteUserId(id);
    setOpenDialog('deleteUser');
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/users/${deleteUserId}`);
      await fetchUsers();
      setMessage('User deleted successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to delete user');
      setMessageType('error');
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
      setOpenDialog(null);
    }
  };

  const handleEditUser = async (user: User) => {
    router.push(`/admin/users?uid=${user.id}`);
  };

  const removeQueryParams = () => {
    const { pathname } = window.location;
    router.push(pathname);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roles: ['user'],
      googleAccessToken: '',
      googleRefreshToken: '',
      googleTokenExpiry: 0,
    });
    setMessage('');
    setMessageType('');
    setFormVisible(false);
    removeQueryParams();
  };

  const handleOpenDialog = (dialogId: string) => {
    setOpenDialog(dialogId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handlePasswordChange = async (
    userId: number | null,
    password: string
  ) => {
    if (!userId && !password) {
      setMessage('Password cannot be empty');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setMessage('Failed to change password');
        setMessageType('error');
      }

      setMessage('Password changed successfully');
      setMessageType('success');
      handleCloseDialog();
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Failed to change password');
      setMessageType('error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
      await fetchRoles();
      if (uid) {
        await fetchUserById(uid as string);
      }
    };

    fetchData();
  }, [uid, fetchUsers, fetchRoles, fetchUserById]);

  return (
    <>
      <Navbar></Navbar>
      <main className={styles.usersPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>User Management</h1>
            <Button
              buttonType={'button'}
              styleType={'primary'}
              ariaLabel={'Add User'}
              onClick={() => {
                resetForm();
                setFormVisible(true);
              }}
            >
              Add User
            </Button>
          </div>
          {formVisible && (
            <form onSubmit={handleFormSubmit} className={styles.form}>
              {message && (
                <Message message={message} type={messageType}></Message>
              )}
              <FormInput
                label={'Username'}
                id={'username'}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              <FormInput
                label={'Email'}
                id={'email'}
                type={'email'}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              {!formData.id && (
                <>
                  <FormInput
                    label={'Password'}
                    id={'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <FormInput
                    label={'Confirm Password'}
                    id={'confirmPassword'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </>
              )}
              <div>
                <h3>Roles</h3>
                <ul className={styles.rolesList}>
                  {roles.map((role: Role) => (
                    <li key={role.id}>
                      <FormCheckbox
                        label={role.name}
                        id={'role-' + role.id}
                        value={role.id.toString()}
                        checked={formData.roles.includes(role.name)}
                      />
                    </li>
                  ))}
                </ul>

                {formData.id && (
                  <>
                    <Button
                      ariaLabel={'Change Password'}
                      buttonType={'button'}
                      onClick={() => handleOpenDialog('passChange')}
                      styleType={'danger'}
                    >
                      Change Password
                    </Button>

                    <PasswordChangeDialog
                      isOpen={openDialog === 'passChange'}
                      onClose={handleCloseDialog}
                      onSubmit={(password) =>
                        handlePasswordChange(formData.id, password)
                      }
                    />
                  </>
                )}
              </div>
              <Button
                ariaLabel={'Save User'}
                styleType={'primary'}
                buttonType={'submit'}
              >
                Save User
              </Button>
              <Button
                ariaLabel={'Cancel'}
                onClick={resetForm}
                styleType={'secondary'}
                buttonType={'button'}
              >
                Cancel
              </Button>
            </form>
          )}
          {users.length === 0 ? (
            <p className={styles.noUsers}>No users available.</p>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              actions={(row: Record<string, any>) => {
                const user = row as User;
                return (
                  <>
                    <Button
                      ariaLabel={'Edit'}
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      ariaLabel={'Delete'}
                      onClick={() => handleDeleteUser(Number(user.id))}
                      styleType={'danger'}
                    >
                      Delete
                    </Button>
                  </>
                );
              }}
            ></DataTable>
          )}
        </div>
      </main>
      <Footer></Footer>
      <ConfirmAction
        isOpen={openDialog === 'deleteUser'}
        onClose={handleCloseDialog}
        onConfirm={confirmDeleteUser}
        message="Are you sure you want to delete this user?"
        isLoading={isLoading}
      />
    </>
  );
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersPageContent />
    </Suspense>
  );
}

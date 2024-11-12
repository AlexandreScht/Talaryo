'use client';

import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { role, tableUser } from '@/interfaces/users';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, SuccessToast } from '@/utils/toaster';
import { AutocompleteItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import Button from '../buttons';
import Select from '../inputs/select';

type keyHead = 'lastName' | 'firstName' | 'email' | 'role';
const TableLayout = ({
  userList,
  queries,
}: {
  userList: tableUser[];
  queries?: {
    lastName?: string;
    firstName?: string;
    email?: string;
    role?: role;
    page?: string;
  };
}) => {
  const {
    services: { updateUsers },
  } = useAppContext();

  const [changeValues, setChangeValues] = useState<tableUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const router = useRouter();

  const Users: tableUser[] = useMemo(() => {
    return userList.map((user) => {
      const changedUser = changeValues.find(
        (changed) => changed.id === user.id,
      );
      return changedUser || user;
    });
  }, [userList, changeValues]);

  const handleSetSearch = useCallback(
    (key: keyHead, value: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (!value) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _, ...rest } = queries || {};
          return router.push(routes.pages.userOffice({ ...rest, page: 1 }));
        }
        const { ...rest } = queries || {};
        return router.push(
          routes.pages.userOffice({ ...rest, page: 1, [key]: value }),
        );
      }, 250);
    },
    [queries, router],
  );
  const handleSearchRole = useCallback(
    (role: role) => handleSetSearch('role', role as string),
    [handleSetSearch],
  );

  const handleSaveChanges = useCallback(async () => {
    setLoading(true);
    try {
      for (const value of changeValues) {
        const { err, res } = await updateUsers(value);
        if (err || !res) {
          ErrorToast({ error: err });
          throw new ClientException(500, 'error on saving data');
        }
      }
      setChangeValues([]);
      SuccessToast({ text: 'users succefully updated' });
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      setLoading(false);
    }
  }, [changeValues, updateUsers]);

  const handleInputChange = useCallback(
    (id: number, key: keyHead, value: string) => {
      setChangeValues((prev) => {
        const updateUser = Users.filter((user) => user.id === id).map(
          (user) => ({ ...user, [key]: value }) as tableUser,
        );
        return [...prev.filter((user) => user.id !== id), ...updateUser];
      });
    },
    [Users],
  );

  return (
    <>
      <div className="bg-content/20 p-2 rounded-lg shadow-sm shadow-shadow">
        <table className="w-full rounded-lg">
          <thead className="bg-asset/10 text-lg font-semibold text-left">
            <tr>
              <th className="rounded-l-lg py-0.5 pl-5 w-5"></th>
              <th className="w-1/6">
                <div className="w-full h-full pr-2.5 flex flex-row">
                  <span className="w-fit mr-2">Nom:</span>
                  <input
                    defaultValue={queries?.lastName}
                    onChange={(e) =>
                      handleSetSearch('lastName', e.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </th>
              <th className="w-[20%]">
                <div className="w-full h-full pr-2.5 flex flex-row">
                  <span className="w-fit mr-3">Prenom:</span>
                  <input
                    defaultValue={queries?.firstName}
                    onChange={(e) =>
                      handleSetSearch('firstName', e.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </th>
              <th className="w-2/6">
                <div className="w-full h-full pr-2.5 flex flex-row">
                  <span className="w-fit mr-3">Mail:</span>
                  <input
                    defaultValue={queries?.email}
                    onChange={(e) => handleSetSearch('email', e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </th>
              <th className="w-2/12">
                <div className="w-full h-full pr-2.5 flex flex-row">
                  <span className="w-fit mr-3">Plan:</span>
                  <Select
                    aria-label="choose role"
                    defaultSelectedKey={queries?.role}
                    chooseValues={handleSearchRole}
                    className="bg-transparent"
                  >
                    <AutocompleteItem key="business">Business</AutocompleteItem>
                    <AutocompleteItem key="advanced">Advanced</AutocompleteItem>
                    <AutocompleteItem key="pro">Pro</AutocompleteItem>
                    <AutocompleteItem key="free">Free</AutocompleteItem>
                    <AutocompleteItem key="aucun">Aucun</AutocompleteItem>
                  </Select>
                </div>
              </th>
              <th className="rounded-r-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="w-full h-5" />
            {Users.map((user, i) => (
              <React.Fragment key={i}>
                <tr
                  className={cn('rounded-lg text-lg hover:bg-asset/20', {
                    'bg-special/10': i % 2 === 1,
                  })}
                >
                  <td className="w-5 rounded-l-lg"></td>
                  <td className="pr-2.5">
                    <input
                      type="text"
                      autoComplete="off"
                      value={user.lastName}
                      onChange={(e) =>
                        handleInputChange(user.id, 'lastName', e.target.value)
                      }
                      className="outline-none box-border w-full bg-transparent"
                    />
                  </td>
                  <td className="pr-2.5">
                    <input
                      type="text"
                      autoComplete="off"
                      value={user.firstName}
                      onChange={(e) =>
                        handleInputChange(user.id, 'firstName', e.target.value)
                      }
                      className="outline-none box-border w-full bg-transparent"
                    />
                  </td>
                  <td className="py-1.5 pr-2.5">
                    <input
                      type="text"
                      autoComplete="off"
                      value={user.email}
                      onChange={(e) =>
                        handleInputChange(user.id, 'email', e.target.value)
                      }
                      className="outline-none box-border w-full bg-transparent"
                    />
                  </td>
                  <td>{user.role}</td>
                  <td className="rounded-r-lg">action</td>
                </tr>
                {i !== userList?.length - 1 && <tr className="w-full h-1" />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full flex justify-center mt-8">
        <Button
          className={cn(
            'text-xl text-white relative w-40 py-5 bg-secondary/40 rounded-lg border-2 border-shadow',
            {
              'bg-gradient-to-tr text-white from-secondary to-special opacity-100 border-2 border-primary':
                changeValues?.length,
            },
          )}
          type="button"
          onClick={handleSaveChanges}
          disabled={!changeValues?.length}
          isLoading={loading}
        >
          Enregistrer
        </Button>
      </div>
    </>
  );
};

export default TableLayout;

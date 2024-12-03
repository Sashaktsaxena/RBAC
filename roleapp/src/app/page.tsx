"use client"
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Toast } from '@/components/ui/toast';

// Expanded Permission Types
const PERMISSIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  FULL_ACCESS: 'full_access'
};

// User and Role Types
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  permissions: string[];
}

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

// Current logged-in user (simulated - in real app, this would come from authentication)
const CURRENT_USER: User = {
  id: 1,
  username: 'admin', 
  email: 'admin@example.com', 
  role: 'Super Admin', 
  status: 'Active',
  permissions: [PERMISSIONS.FULL_ACCESS]
};

// Mock data structures
const initialUsers: User[] = [
  { 
    id: 1, 
    username: 'admin', 
    email: 'admin@example.com', 
    role: 'Super Admin', 
    status: 'Active',
    permissions: [PERMISSIONS.FULL_ACCESS]
  },
  { 
    id: 2, 
    username: 'john_doe', 
    email: 'john@example.com', 
    role: 'Editor', 
    status: 'Active',
    permissions: [PERMISSIONS.READ, PERMISSIONS.UPDATE]
  }
];

const initialRoles: Role[] = [
  { 
    id: 1, 
    name: 'Super Admin', 
    permissions: [PERMISSIONS.FULL_ACCESS] 
  },
  { 
    id: 2, 
    name: 'Editor', 
    permissions: [PERMISSIONS.READ, PERMISSIONS.UPDATE] 
  }
];

const permissionsList = Object.values(PERMISSIONS);

const RBACDashboard = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    role: '',
    status: 'Active',
    permissions: [] as string[]
  });

  // Permission Check Utility
  const hasPermission = (requiredPermission: string) => {
    // Super admin always has full access
    if (CURRENT_USER.permissions.includes(PERMISSIONS.FULL_ACCESS)) {
      return true;
    }
    
    // Check if current user has the required permission
    return CURRENT_USER.permissions.includes(requiredPermission);
  };

  // User Management Handlers with Permission Checks
  const handleAddUser = () => {
    // Check for create permission
    if (!hasPermission(PERMISSIONS.CREATE)) {
      Toast({
        title: "Permission Denied",
        description: "You do not have permission to add users.",
        variant: "destructive"
      });
      return;
    }

    const newUser = {
      ...newUserForm,
      id: users.length + 1
    };
    setUsers([...users, newUser]);
    setIsAddUserDialogOpen(false);
    // Reset form
    setNewUserForm({
      username: '',
      email: '',
      role: '',
      status: 'Active',
      permissions: []
    });
  };

  const handleEditUser = () => {
    // Check for update permission
    if (!hasPermission(PERMISSIONS.UPDATE)) {
      Toast({
        title: "Permission Denied",
        description: "You do not have permission to edit users.",
        variant: "destructive"
      });
      return;
    }

    setUsers(users.map(user => 
      user.id === selectedUser?.id 
        ? { ...selectedUser } 
        : user
    ));
    setIsEditUserDialogOpen(false);
  };

  const handleDeleteUser = () => {
    // Check for delete permission
    if (!hasPermission(PERMISSIONS.DELETE)) {
      Toast({
        title: "Permission Denied",
        description: "You do not have permission to delete users.",
        variant: "destructive"
      });
      return;
    }

    setUsers(users.filter(user => user.id !== selectedUser?.id));
    setIsDeleteUserDialogOpen(false);
  };

  const handlePermissionChange = (permission: string) => {
    // Only full access users can modify permissions
    if (!hasPermission(PERMISSIONS.FULL_ACCESS)) {
      Toast({
        title: "Permission Denied",
        description: "You do not have permission to modify user permissions.",
        variant: "destructive"
      });
      return;
    }

    if (selectedUser) {
      const currentPermissions = selectedUser.permissions || [];
      const updatedPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];
      
      setSelectedUser({
        ...selectedUser,
        permissions: updatedPermissions
      });
    }
  };

  const openEditUserDialog = (user: User) => {
    // Check for update permission
    if (!hasPermission(PERMISSIONS.UPDATE)) {
      Toast({
        title: "Permission Denied",
        description: "You do not have permission to edit users.",
        variant: "destructive"
      });
      return;
    }

    setSelectedUser({...user});
    setIsEditUserDialogOpen(true);
  };

  const openDeleteUserDialog = (user: User) => {
    // Check for delete permission
    if (!hasPermission(PERMISSIONS.DELETE)) {
      Toast({
        title: "Permission Denied",
        description: "You do not have permission to delete users.",
        variant: "destructive"
      });
      return;
    }

    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Users Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Management</CardTitle>
            {hasPermission(PERMISSIONS.CREATE) ? (
              <Button 
                variant="outline" 
                onClick={() => setIsAddUserDialogOpen(true)}
              >
                <Plus className="mr-2" /> Add User
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <Lock className="mr-2" /> Add User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'Active' ? 'default' : 'destructive'}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {hasPermission(PERMISSIONS.UPDATE) ? (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditUserDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="icon"
                          disabled
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission(PERMISSIONS.DELETE) ? (
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => openDeleteUserDialog(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="destructive" 
                          size="icon"
                          disabled
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog (with permission checks) */}
      {hasPermission(PERMISSIONS.CREATE) && (
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input 
                id="username" 
                value={newUserForm.username}
                onChange={(e) => setNewUserForm({
                  ...newUserForm, 
                  username: e.target.value
                })}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input 
                id="email" 
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({
                  ...newUserForm, 
                  email: e.target.value
                })}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={newUserForm.role}
                onValueChange={(value) => setNewUserForm({
                  ...newUserForm, 
                  role: value
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Permissions</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {permissionsList.map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`new-${permission}`}
                      checked={newUserForm.permissions.includes(permission)}
                      onCheckedChange={() => {
                        const currentPermissions = newUserForm.permissions;
                        setNewUserForm({
                          ...newUserForm,
                          permissions: currentPermissions.includes(permission)
                            ? currentPermissions.filter(p => p !== permission)
                            : [...currentPermissions, permission]
                        });
                      }}
                    />
                    <Label htmlFor={`new-${permission}`}>{permission}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog (with permission checks) */}
      {hasPermission(PERMISSIONS.UPDATE) && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          {/* ... (most of the edit user dialog remains the same) ... */}
          {selectedUser && (
            <div className="grid gap-4 py-4">
 <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">
                  Username
                </Label>
                <Input 
                  id="edit-username" 
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser, 
                    username: e.target.value
                  })}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="edit-email" 
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser, 
                    email: e.target.value
                  })}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser({
                    ...selectedUser, 
                    role: value
                  })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select 
                  value={selectedUser.status}
                  onValueChange={(value) => setSelectedUser({
                    ...selectedUser, 
                    status: value
                  })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Permissions</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {permissionsList.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission}`}
                        checked={selectedUser.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionChange(permission)}
                        // Disable permission checkbox if not full access
                        disabled={!hasPermission(PERMISSIONS.FULL_ACCESS)}
                      />
                      <Label 
                        htmlFor={`edit-${permission}`}
                        className={!hasPermission(PERMISSIONS.FULL_ACCESS) ? "text-muted-foreground" : ""}
                      >
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Delete User Dialog (with permission checks) */}
      {hasPermission(PERMISSIONS.DELETE) && (
        <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user {selectedUser?.username}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default RBACDashboard;
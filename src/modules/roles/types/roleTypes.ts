export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  isSystemRole?: boolean;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;

}

export interface RoleUpsertDto {
  id?: string;
  name: string;
  description?: string;
}

export interface RolePermissionDto {
  key: string;
  name: string;
  description?: string;
  category?: string;
  granted: boolean;
}

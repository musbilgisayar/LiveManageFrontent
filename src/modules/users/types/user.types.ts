//src/modules/users/types/user.types.ts
export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string | null;
  data?: T;
  errors?: string[] | null;
}

export interface PagedResultDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UserListItemDto {
  id: string;
  userName?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;

  isActive?: boolean | null;
  isDeleted?: boolean | null;
  emailConfirmed?: boolean | null;
  phoneNumberConfirmed?: boolean | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  roles?: string[] | null;
}
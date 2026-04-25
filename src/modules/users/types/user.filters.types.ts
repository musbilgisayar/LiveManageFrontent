//src/modules/users/types/user.filters.types.ts
export interface UserListQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface UserListPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
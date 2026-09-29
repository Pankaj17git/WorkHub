export interface PaginationRequest {
  page?: number;
  limit?: number;
}


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPagination(params: PaginationRequest) {
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(params.limit) || 2, 1),
    100
  );

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  console.log("tje total lenght", total)
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

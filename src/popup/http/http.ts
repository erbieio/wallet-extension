declare interface RequestParams {
  [key: string]: any;
}

interface GetTransitionsParams {
  module: string;
  action: string;
  address: string;
  apikey: string;
}

export interface PageParams {
  page: number;
  page_size: number;
}

export interface PageResponse {
  total: number;
}

export type SorterResult<T> = {
  field: keyof T;
  order: "ascend" | "descend";
  columnKey?: React.Key;
  column: TableColumnsType<unknown>;
};

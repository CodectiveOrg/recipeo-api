export type Paginated<T> = {
  items: T[];
  currentPage: number;
  lastPage: number;
};

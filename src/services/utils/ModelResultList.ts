import BaseRecord from "@/index";

export default class ModelResultList<M = BaseRecord> {
  totalSize!: number;
  size!: number;
  hasMoreResults!: boolean;
  from!: number;
  data!: M[] | M;

  constructor(
    totalSize?: number,
    size?: number,
    hasMoreResults?: boolean,
    from?: number,
    data?: M[] | M
  ) {
    if (data && Array.isArray(data)) {
      this.totalSize = totalSize || 0;
      this.size = size || 0;
      this.hasMoreResults = hasMoreResults || false;
      this.from = typeof from !== "undefined" ? from : -1;
    }
    this.data = data || [];
  }
}

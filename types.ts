
export enum RowOption {
  ROW_1 = '第一排',
  ROW_2 = '第二排',
  ROW_3 = '第三排'
}

export enum DefenseStatus {
  READY = '待命',
  PREPARING = '準備中',
  ACTIVE = '閉城中',
  COOLDOWN = '冷卻中'
}

export interface DefensePoint {
  id: string;
  location: string;
  row: RowOption;
  guardian: string;
  status: DefenseStatus;
  startTime: number | null; // Start of preparation
  prepEndTime: number | null;
  activeEndTime: number | null;
  cdEndTime: number | null;
  lastUpdate: number;
}

export const PREP_DURATION = 2.5 * 60 * 60 * 1000; // 2.5 hours
export const ACTIVE_DURATION = 5 * 60 * 60 * 1000; // 5 hours
export const CD_DURATION = 6 * 60 * 60 * 1000; // 6 hours

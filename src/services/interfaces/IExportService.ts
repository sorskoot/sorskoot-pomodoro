import type { AppData } from '../../types';

export interface IExportService {
  exportData(): AppData;
  importData(data: unknown): AppData;
}

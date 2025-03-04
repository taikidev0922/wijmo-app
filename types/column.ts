import { DataType, Control } from "@mescius/wijmo";
import { ICellTemplateFunction } from "@mescius/wijmo.grid";
export type ColumnType = {
  binding: string;
  header: string;
  dataType: DataType;
  width?: number;
  allowResizing?: boolean;
  editor?: Control;
  dataMap?: string[];
  cellTemplate?: ICellTemplateFunction;
};

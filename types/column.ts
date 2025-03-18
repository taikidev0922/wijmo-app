import { Aggregate, Control, DataType as WjDataType } from "@mescius/wijmo";
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
  isReadOnly?: boolean;
  aggregate?: Aggregate;
  format?: string;
};

export type DataType = "string" | "number" | "date" | "boolean";

export function DataTypeMap(dataType: DataType) {
  switch (dataType) {
    case "string":
      return WjDataType.String;
    case "number":
      return WjDataType.Number;
    case "date":
      return WjDataType.Date;
    case "boolean":
      return WjDataType.Boolean;
  }
}

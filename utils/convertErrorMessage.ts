import { DexieError } from "dexie";

export function convertErrorMessage(error: DexieError): string {
  if (error.name === "ConstraintError") {
    return "データが重複しています";
  }
  if (error.name === "TransactionError") {
    return "トランザクションエラーが発生しました";
  }
  if (error.name === "SchemaError") {
    return "スキーマエラーが発生しました";
  }
  return error.message;
}

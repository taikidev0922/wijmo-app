"use client";
import { ColumnType } from "@/types/column";
import { FlexGrid as FlexGridBase } from "@mescius/wijmo.react.grid";
import {
  Column,
  DataMap,
  ICellTemplateContext,
  FlexGrid as IFlexGrid,
  KeyAction,
} from "@mescius/wijmo.grid";
import { Button } from "./ui/button";
import { FlexGridFilter } from "@mescius/wijmo.react.grid.filter";
import { Copy, FileX, PlusCircle, Save, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { FlexGridXlsxConverter } from "@mescius/wijmo.grid.xlsx";
import { Operation } from "@/enums/Operation";
import { CollectionView, Control } from "@mescius/wijmo";
import toast from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { renderToString } from "react-dom/server";
import { AlertCircle } from "lucide-react";
import { CellMaker } from "@mescius/wijmo.grid.cellmaker";
import { useDialog } from "@/contexts/DialogContext";

interface FlexGridProps<T> {
  columns: ColumnType[];
  collectionView: CollectionView<T> | undefined;
  originalItems: Partial<T & { id: string }>[];
  grid: IFlexGrid | undefined;
  setGrid: (grid: IFlexGrid) => void;
}

export function FlexGrid<T>({
  columns,
  collectionView,
  originalItems,
  grid,
  setGrid,
}: FlexGridProps<T>) {
  const { showDialog } = useDialog();
  useHotkeys("alt+;", () => addRow(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+c", () => copyRow(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+d", () => deleteRow(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+x", () => cancelRow(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+s", () => saveLayout(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+e", () => exportExcel(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useEffect(() => {
    if (!grid) return;
    grid.rowHeaders.columns.removeAt(0);
    grid?.rowHeaders.columns.insert(
      0,
      new Column({
        header: " ",
        binding: " ",
        width: 55,
        allowResizing: false,
        cellTemplate: (ctx: ICellTemplateContext) => {
          return ctx.row.index + 1;
        },
      })
    );
    grid?.rowHeaders.columns.insert(
      1,
      new Column({
        header: " ",
        binding: "operation",
        width: 40,
        allowResizing: false,
        cellTemplate: (ctx: ICellTemplateContext) => {
          if (ctx.value === Operation.Delete) {
            return `<div class="bg-red-500 text-white rounded-md text-center">D</div>`;
          }
          if (ctx.value === Operation.Update) {
            return `<div class="bg-green-500 text-white rounded-md text-center">U</div>`;
          }
          if (ctx.value === Operation.Insert) {
            return `<div class="bg-blue-500 text-white rounded-md text-center">I</div>`;
          }
        },
      })
    );
    grid?.rowHeaders.columns.insert(
      2,
      new Column({
        header: " ",
        binding: "error",
        width: 40,
        allowResizing: false,
        cellTemplate: (ctx: ICellTemplateContext, cell: HTMLElement) => {
          if (!ctx.value) return " ";
          const icon = renderToString(<AlertCircle className="error-icon" />);
          return CellMaker.makeButton({
            text: ctx.value ? icon : " ",
            click(e, ctx) {
              if (ctx.value) {
                showDialog({
                  title: "エラー",
                  description: ctx.value,
                  confirmText: "OK",
                  showCancelButton: false,
                });
              }
            },
          })(ctx, cell);
        },
      })
    );

    grid.cellEditEnded.addHandler(() => {
      grid.beginUpdate();
      if (grid.collectionView.currentItem.id) {
        grid.collectionView.currentItem.operation = Operation.Update;
      } else {
        grid.collectionView.currentItem.operation = Operation.Insert;
      }
      grid.endUpdate();
    });
    grid.loadedRows.addHandler(() => {
      loadLayout();
    });
    grid.refreshOnEdit = false;
    grid.keyActionTab = KeyAction.CycleEditable;
  }, [grid]);

  const addRow = async () => {
    grid?.editableCollectionView.addNew();
    await new Promise((resolve) => setTimeout(resolve, 10));
    grid?.scrollIntoView(grid.collectionView.items.length - 1, 0);
    grid?.focus();
  };

  const copyRow = async () => {
    const currentItem = grid?.collectionView.currentItem;
    if (currentItem) {
      const collectionView = grid?.collectionView as CollectionView;
      collectionView.addNew({
        ...currentItem,
        id: undefined,
        name: null,
        operation: Operation.Insert,
        error: null,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    grid?.scrollIntoView(grid.collectionView.items.length - 1, 0);
    grid?.focus();
  };
  const deleteRow = () => {
    if (!grid) return;

    const currentItem = grid.collectionView.currentItem;
    if (!currentItem) return;

    grid.beginUpdate();
    try {
      // 削除フラグの切り替え処理
      if (currentItem.operation === Operation.Delete) {
        currentItem.operation = null;
        grid.endUpdate();
        return;
      }

      // 既存データの場合は論理削除
      if (currentItem.id) {
        currentItem.operation = Operation.Delete;
        grid.endUpdate();
        return;
      }

      // 新規データの場合は物理削除
      const currentIndex = grid.collectionView.items.indexOf(currentItem);
      grid.editableCollectionView.remove(currentItem);
      if (currentIndex !== -1) {
        grid.select(currentIndex, 0);
      }
    } finally {
      grid.endUpdate();
      grid?.focus();
    }
  };

  const cancelRow = () => {
    if (!grid) {
      return;
    }
    grid.beginUpdate();
    const currentIndex = grid.selection.row;
    const currentColumn = grid.selection.col;
    if (grid.collectionView.currentItem.id) {
      const originalItem = originalItems.find(
        (item) => item.id === grid.collectionView.currentItem.id
      );
      if (originalItem) {
        Object.assign(grid.collectionView.currentItem, {
          ...originalItem,
          operation: null,
        });
      }
    } else {
      grid.editableCollectionView.remove(grid.collectionView.currentItem);
    }
    grid.endUpdate();
    grid.select(currentIndex, currentColumn);
    grid?.focus();
  };

  const saveLayout = () => {
    if (grid?.columnLayout) {
      localStorage.setItem("myLayout", grid.columnLayout);
      toast.success("レイアウトを保存しました");
    }
  };

  const loadLayout = async () => {
    if (localStorage.getItem("myLayout") && grid) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      grid.columnLayout = localStorage.getItem("myLayout") ?? "";
      columns.forEach((column) => {
        const gridColumn = grid.columns.find(
          (c) => c.binding === column.binding
        );
        if (gridColumn) {
          gridColumn.dataMap = column.dataMap as unknown as DataMap<
            string,
            string,
            string
          >;
          gridColumn.editor = column.editor as Control;
        }
      });
    }
  };

  const exportExcel = () => {
    if (grid) {
      FlexGridXlsxConverter.saveAsync(
        grid,
        {
          includeColumnHeaders: true,
          includeStyles: false,
        },
        "得意先マスタ.xlsx"
      );
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div className="space-x-2">
          <Button onClick={() => addRow()} variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            行追加(alt+;)
          </Button>
          <Button onClick={() => copyRow()} variant="default">
            <Copy className="mr-2 h-4 w-4" />
            行コピー(alt+c)
          </Button>
          <Button onClick={() => deleteRow()} variant="default">
            <Trash2 className="mr-2 h-4 w-4" />
            行削除(alt+d)
          </Button>
          <Button onClick={() => cancelRow()} variant="default">
            <X className="mr-2 h-4 w-4" />
            取消(alt+x)
          </Button>
          <Button onClick={() => saveLayout()} variant="default">
            <Save className="mr-2 h-4 w-4" />
            レイアウト保存(alt+s)
          </Button>
          <Button onClick={() => exportExcel()} variant="default">
            <FileX className="mr-2 h-4 w-4" />
            Excel出力(alt+e)
          </Button>
        </div>
      </div>
      <FlexGridBase
        itemsSource={collectionView}
        columns={columns}
        autoGenerateColumns={false}
        validateEdits={false}
        imeEnabled={true}
        initialized={setGrid}
        style={{ height: "70vh" }}
      >
        <FlexGridFilter />
      </FlexGridBase>
    </div>
  );
}

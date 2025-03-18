"use client";

import { useState, useEffect } from "react";
import "@mescius/wijmo.styles/wijmo.css";
import { FlexGrid as IFlexGrid } from "@mescius/wijmo.grid";
import { CollectionView, deepClone, IGetError } from "@mescius/wijmo";
import { InputMask } from "@mescius/wijmo.input";
import { ClientAppService } from "@/application/clientAppService";
import { ClientRepository } from "@/infrastructure/repository/clientRepository";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { businessTypeMap } from "@/datas/businessTypes";
import { prefectureMap } from "@/datas/prefectures";
import { useDialog } from "@/contexts/DialogContext";
import { useHotkeys } from "react-hotkeys-hook";
import { Client } from "@/domains/client";
import { FlexGrid } from "@/components/FlexGrid";
import { ColumnType } from "@/types/column";
import { OperationGuide } from "@/components/client/OperationGuide";

export default function Page() {
  const clientAppService = new ClientAppService(new ClientRepository());
  const [grid, setGrid] = useState<IFlexGrid>();
  const [collectionView, setCollectionView] =
    useState<CollectionView<Client>>();
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const { showDialog } = useDialog();
  const [originalClients, setOriginalClients] = useState<Client[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      binding: "name",
      header: "会社名",
      dataType: "string",
    },
    {
      binding: "email",
      header: "メールアドレス",
      dataType: "string",
    },
    {
      binding: "phone",
      header: "電話番号",
      dataType: "string",
      width: 120,
    },
    {
      binding: "postalCode",
      header: "郵便番号",
      dataType: "string",
      width: 100,
    },
    {
      binding: "prefecture",
      header: "都道府県",
      dataType: "string",
      dataMap: prefectureMap,
    },
    {
      binding: "businessType",
      header: "業種",
      dataType: "string",
      dataMap: businessTypeMap,
    },
  ]);

  useHotkeys("alt+y", () => fetchClients({ isConfirm: true }), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+u", () => updateClients(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useEffect(() => {
    const updatedColumns = columns.map((column) => {
      if (column.binding === "phone") {
        return {
          ...column,
          editor: new InputMask(document.createElement("div"), {
            mask: "000-0000-0000",
          }),
        };
      }
      if (column.binding === "postalCode") {
        return {
          ...column,
          editor: new InputMask(document.createElement("div"), {
            mask: "000-0000",
          }),
        };
      }
      return column;
    });
    setColumns(updatedColumns);
  }, []);

  const getError: IGetError<Client> = (item, prop) => {
    if (!item.operation) {
      return null;
    }
    if (prop === "name" && !item.name) {
      return "会社名を入力してください";
    } else if (prop === "email" && !item.email) {
      return "メールアドレスを入力してください";
    } else if (
      prop === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)
    ) {
      return "正しいメールアドレスの形式で入力してください";
    } else if (prop === "businessType" && !item.businessType) {
      return "業種を選択してください";
    }
    return null;
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (options?: {
    isErrorAttach?: boolean;
    isConfirm?: boolean;
  }) => {
    const confirmView = grid?.collectionView as CollectionView;
    if (
      options?.isConfirm &&
      (confirmView?.itemsEdited.length > 0 ||
        confirmView?.itemsAdded.length > 0)
    ) {
      const confirmed = await showDialog({
        title: "確認",
        description:
          "編集中のデータがあります。データを破棄して再取得しますか？",
        confirmText: "再取得",
        cancelText: "キャンセル",
      });

      if (!confirmed) {
        return;
      }
    }

    if (options?.isErrorAttach && grid) {
      (grid.collectionView as CollectionView).getError = getError;
      return;
    }

    const data = options?.isErrorAttach
      ? grid?.collectionView.items
      : await clientAppService.getClients();
    setOriginalClients(deepClone(data) ?? []);
    const _collectionView = new CollectionView(data, {
      refreshOnEdit: false,
      trackChanges: true,
      getError: undefined,
    });
    setCollectionView(_collectionView);
  };
  const updateClients = async () => {
    if (!grid?.collectionView.items.some((item) => item.operation)) {
      toast.error("更新するデータがありません");
      return;
    }
    fetchClients({ isErrorAttach: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (grid?.hostElement.querySelector(".wj-state-invalid")) {
      toast.error("入力内容を確認してください");
      return;
    }
    grid?.collectionView.items.forEach((item, index) => {
      item.uid = index;
    });
    const updatedClients = grid?.collectionView.items
      .filter((item) => item.operation)
      .map((item) => {
        return {
          ...item,
        };
      }) as Client[];
    const results = await clientAppService.bulkCreateUpdate(updatedClients);
    if (results.length > 0) {
      toast.error("更新に失敗しました");
      grid?.beginUpdate();
      grid?.collectionView.items.forEach((item) => {
        item.error = undefined;
      });
      results.forEach((result) => {
        const item = grid?.collectionView.items.find(
          (item) => item.uid === result.uid
        );
        if (item) {
          item.error = result.error;
        }
      });
      grid?.endUpdate();
      return;
    }
    await fetchClients();
    toast.success("更新しました");
    grid?.select(0, 0);
  };

  return (
    <div className=" bg-gray-50">
      <div className="p-6 flex">
        <div
          className={`transition-all duration-300 relative ${
            isGuideOpen ? "w-[calc(100%-450px)]" : "w-full pr-[40px]"
          }`}
        >
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                得意先マスタ
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                得意先情報の一覧表示と編集ができます
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Button
                onClick={() => fetchClients({ isConfirm: true })}
                variant="outline"
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 text-gray-700 min-w-[140px]"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">再取得(alt+y)</span>
              </Button>
              <Button
                onClick={() => updateClients()}
                variant="default"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[140px]"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">一括更新(alt+u)</span>
              </Button>
            </div>
          </div>
          <FlexGrid<Client>
            gridKey="得意先マスタ"
            columns={columns}
            collectionView={collectionView}
            originalItems={originalClients}
            grid={grid}
            setGrid={setGrid}
          />
        </div>

        <div
          className={`
            fixed right-0 top-16 h-[calc(100%-64px)] bg-white border-l shadow-lg
            transition-all duration-300
            ${isGuideOpen ? "w-[450px]" : "w-[40px]"}
          `}
          style={{ zIndex: 1 }}
        >
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="absolute top-4 -left-5 bg-white border rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
            style={{ zIndex: 2 }}
          >
            {isGuideOpen ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
          <div
            className={`h-full flex flex-col ${
              isGuideOpen ? "block" : "hidden"
            }`}
          >
            <div className="border-b border-gray-200">
              <h2 className="text-xl font-bold p-4 ml-4 text-gray-900">
                操作ガイド
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <OperationGuide />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

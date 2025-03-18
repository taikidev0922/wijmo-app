"use client";

import { useState, useEffect } from "react";
import "@mescius/wijmo.styles/wijmo.css";
import { FlexGrid as IFlexGrid } from "@mescius/wijmo.grid";
import { CollectionView, deepClone, IGetError } from "@mescius/wijmo";
import { ProductAppService } from "@/application/productAppService";
import { ProductRepository } from "@/infrastructure/repository/productRepository";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useDialog } from "@/contexts/DialogContext";
import { useHotkeys } from "react-hotkeys-hook";
import { Product } from "@/domains/product";
import { FlexGrid } from "@/components/FlexGrid";
import { categorys } from "@/datas/categorys";
import { ColumnType } from "@/types/column";

export default function Page() {
  const productAppService = new ProductAppService(new ProductRepository());
  const [grid, setGrid] = useState<IFlexGrid>();
  const [collectionView, setCollectionView] =
    useState<CollectionView<Product>>();
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const { showDialog } = useDialog();
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);

  useHotkeys("alt+y", () => fetchProducts({ isConfirm: true }), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+u", () => updateProducts(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  const columns: ColumnType[] = [
    {
      binding: "code",
      header: "商品コード",
      dataType: "string",
    },
    {
      binding: "name",
      header: "商品名",
      dataType: "string",
    },
    {
      binding: "description",
      header: "説明",
      dataType: "string",
    },
    {
      binding: "price",
      header: "価格",
      dataType: "number",
    },
    {
      binding: "quantity",
      header: "在庫数",
      dataType: "number",
    },
    {
      binding: "category",
      header: "カテゴリー",
      dataType: "string",
      dataMap: categorys,
    },
  ];

  const getError: IGetError<Product> = (item, prop) => {
    if (!item.operation) {
      return null;
    }
    if (prop === "name" && !item.name) {
      return "商品名を入力してください";
    } else if (prop === "code" && !item.code) {
      return "商品コードを入力してください";
    } else if (prop === "price" && (!item.price || item.price < 0)) {
      return "0以上の価格を入力してください";
    } else if (prop === "quantity" && (!item.quantity || item.quantity < 0)) {
      return "0以上の在庫数を入力してください";
    } else if (prop === "category" && !item.category) {
      return "カテゴリーを入力してください";
    }
    return null;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (options?: {
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
      : await productAppService.getProducts();
    setOriginalProducts(deepClone(data) ?? []);
    const _collectionView = new CollectionView(data, {
      refreshOnEdit: false,
      trackChanges: true,
      getError: undefined,
    });
    setCollectionView(_collectionView);
  };

  const updateProducts = async () => {
    if (!grid?.collectionView.items.some((item) => item.operation)) {
      toast.error("更新するデータがありません");
      return;
    }
    fetchProducts({ isErrorAttach: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (grid?.hostElement.querySelector(".wj-state-invalid")) {
      toast.error("入力内容を確認してください");
      return;
    }
    grid?.collectionView.items.forEach((item, index) => {
      item.uid = index;
    });
    const updatedProducts = grid?.collectionView.items
      .filter((item) => item.operation)
      .map((item) => {
        return {
          ...item,
        };
      }) as Product[];
    const results = await productAppService.bulkCreateUpdate(updatedProducts);
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
    await fetchProducts();
    toast.success("更新しました");
    grid?.select(0, 0);
  };

  return (
    <div className="bg-gray-50">
      <div className="p-6 flex">
        <div
          className={`transition-all duration-300 relative ${
            isGuideOpen ? "w-[calc(100%-450px)]" : "w-full pr-[40px]"
          }`}
        >
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                商品マスタ
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                商品情報の一覧表示と編集ができます
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Button
                onClick={() => fetchProducts({ isConfirm: true })}
                variant="outline"
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 text-gray-700 min-w-[140px]"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">再取得(alt+y)</span>
              </Button>
              <Button
                onClick={() => updateProducts()}
                variant="default"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[140px]"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">一括更新(alt+u)</span>
              </Button>
            </div>
          </div>
          <FlexGrid<Product>
            gridKey="商品マスタ"
            columns={columns}
            collectionView={collectionView}
            originalItems={originalProducts}
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
              <div className="p-6">{/* ここに操作ガイドの内容を追加 */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

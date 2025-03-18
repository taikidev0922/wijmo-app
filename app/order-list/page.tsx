"use client";
import { OrderAppService } from "@/application/orderAppService";
import { OrderRepository } from "@/infrastructure/repository/orderRepository";
import { Order } from "@/domains/order";
import { useEffect, useState } from "react";
import { FlexGrid as IFlexGrid } from "@mescius/wijmo.grid";
import { CollectionView } from "@mescius/wijmo";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { InvoiceService } from "@/application/invoiceService";
import { FlexGrid } from "@/components/FlexGrid";
import { ColumnType } from "@/types/column";

export default function OrderListPage() {
  const orderAppService = new OrderAppService(new OrderRepository());
  const [invoiceService, setInvoiceService] = useState<InvoiceService | null>(
    null
  );
  const [grid, setGrid] = useState<IFlexGrid>();
  const [collectionView, setCollectionView] = useState<CollectionView<Order>>();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [originalOrders, setOriginalOrders] = useState<Order[]>([]);

  const columns: ColumnType[] = [
    {
      binding: "orderNo",
      header: "受注No",
      dataType: "string",
    },
    {
      binding: "orderDate",
      header: "受注日",
      format: "d",
      dataType: "date",
    },
    {
      binding: "client.name",
      header: "得意先",
      dataType: "string",
    },
    {
      binding: "totalAmount",
      header: "合計金額",
      dataType: "number",
    },
  ];

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      import("@/application/invoiceService").then(({ InvoiceService }) => {
        setInvoiceService(new InvoiceService());
      });
    }

    const fetchOrders = async () => {
      const orders = await orderAppService.getOrders();
      setOriginalOrders(orders);
      initializeCollectionView(orders);
    };
    fetchOrders();
  }, []);

  const initializeCollectionView = (orders: Order[]) => {
    setCollectionView(
      new CollectionView(orders, {
        calculatedFields: {
          totalAmount: ($: Order) =>
            $.orderDetails.reduce(
              (sum, detail) =>
                sum + (detail.quantity * detail.product?.price || 0),
              0
            ),
        },
      })
    );
  };

  const showOrder = () => {
    const order = grid?.collectionView.currentItem as Order;
    router.push(`/order?order-no=${order.orderNo}`);
  };

  const generateInvoicePdf = async () => {
    const order = grid?.collectionView.currentItem as Order;
    if (!order) {
      alert("受注を選択してください");
      return;
    }

    if (!invoiceService) {
      alert("PDFサービスの初期化中です。しばらくお待ちください。");
      return;
    }

    try {
      await invoiceService.generateInvoice(order);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDF生成中にエラーが発生しました");
    }
  };

  useHotkeys("alt+v", () => showOrder(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+p", () => generateInvoicePdf(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  if (!isClient) {
    return <div>Loading...</div>;
  }

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
                受注一覧
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                受注情報の一覧表示と操作ができます
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Button
                onClick={showOrder}
                variant="outline"
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 text-gray-700 min-w-[140px]"
              >
                <span className="whitespace-nowrap">受注伝票表示(alt+v)</span>
              </Button>
              <Button
                onClick={generateInvoicePdf}
                variant="default"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[140px]"
              >
                <span className="whitespace-nowrap">請求書出力(alt+p)</span>
              </Button>
            </div>
          </div>
          <FlexGrid<Order>
            gridKey="受注一覧"
            isReadOnly={true}
            columns={columns}
            collectionView={collectionView}
            originalItems={originalOrders}
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

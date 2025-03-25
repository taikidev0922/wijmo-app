"use client";
import { AutoComplete, InputDate } from "@mescius/wijmo.react.input";
import { AutoComplete as IAutoComplete } from "@mescius/wijmo.input";
import { ComboBox as IComboBox } from "@mescius/wijmo.input";
import {
  CellRange,
  CellRangeEventArgs,
  GroupRow,
  FlexGrid as IFlexGrid,
} from "@mescius/wijmo.grid";
import { Aggregate, CollectionView, IGetError } from "@mescius/wijmo";
import { ClientAppService } from "@/application/clientAppService";
import { ClientRepository } from "@/infrastructure/repository/clientRepository";
import { useEffect, useRef } from "react";
import { Client } from "@/domains/client";
import { useState } from "react";
import { TextInput } from "@/components/TextInput";
import { FlexGrid } from "@/components/FlexGrid";
import { ColumnType } from "@/types/column";
import { OrderDetail } from "@/domains/orderDetail";
import { Product } from "@/domains/product";
import { ProductRepository } from "@/infrastructure/repository/productRepository";
import { ProductAppService } from "@/application/productAppService";
import { Button } from "@/components/ui/button";
import { OrderAppService } from "@/application/orderAppService";
import { OrderRepository } from "@/infrastructure/repository/orderRepository";
import { toast } from "react-hot-toast";
import { Order as OrderEntity } from "@/domains/order";
import { Operation } from "@/enums/Operation";
import { useDialog } from "@/contexts/DialogContext";
import { useWijmoDialog } from "@/contexts/WijmoDialogContext";
import { ProductSearchDialog } from "@/components/product/ProductSearchDialog";
import { ClientSearchDialog } from "@/components/client/ClientSearchDialog";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OperationGuide } from "@/components/order/OperationGuide";

export default function Order() {
  const { showDialog } = useDialog();
  const { showWijmoDialog, handleClose } = useWijmoDialog();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>();
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  const getError: IGetError<OrderDetail> = (item, prop) => {
    if (!item.operation) {
      return null;
    }
    if (prop === "product.code" && !item.product.code) {
      return "商品コードを入力してください";
    } else if (prop === "quantity" && item.quantity < 1) {
      return "1以上の数量を入力してください";
    }
    return null;
  };

  useHotkeys("alt+n", () => clearOrder({ isClearClient: true }), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+u", () => registerOrder(), {
    enableOnFormTags: true,
    preventDefault: true,
  });
  useHotkeys("alt+m", () => deleteOrder(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useEffect(() => {
    if (!products || products.length === 0) {
      return;
    }
    const updatedColumns = [
      {
        header: "商品コード",
        binding: "product.code",
        dataType: "string",
        editor: new IAutoComplete(document.createElement("div"), {
          itemsSource: products,
          displayMemberPath: "code",
          placeholder: "F4で検索",
        }),
      },
      {
        header: "商品名",
        binding: "product.name",
        dataType: "string",
        isReadOnly: true,
      },
      {
        header: "在庫数",
        binding: "product.quantity",
        dataType: "number",
        isReadOnly: true,
      },
      {
        header: "単価(円)",
        binding: "product.price",
        dataType: "number",
        isReadOnly: true,
      },
      {
        header: "数量",
        binding: "quantity",
        dataType: "number",
      },
      {
        header: "小計(円)",
        binding: "subtotal",
        dataType: "number",
        isReadOnly: true,
        aggregate: Aggregate.Sum,
      },
    ];
    setColumns(updatedColumns as ColumnType[]);
  }, [products]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [order, setOrder] = useState<OrderEntity | null>(null);
  const [clientAutoComplete, setClientAutoComplete] = useState<IAutoComplete>();
  const [salesDate, setSalesDate] = useState<Date | null>(null);
  const selectedClientRef = useRef<Client | null>(null);
  const clietAppService = new ClientAppService(new ClientRepository());
  const productAppService = new ProductAppService(new ProductRepository());
  const orderAppService = new OrderAppService(new OrderRepository());
  const [grid, setGrid] = useState<IFlexGrid>();
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [collectionView, setCollectionView] =
    useState<CollectionView<OrderDetail>>();
  const [orderNo, setOrderNo] = useState<string>("");
  useEffect(() => {
    grid?.hostElement.addEventListener("keydown", (e) => {
      if (e.key === "F4" && grid?.selection.col === 0) {
        showProductSearchDialog();
      }
    });
    grid?.cellEditEnded.addHandler(
      async (sender: IFlexGrid, args: CellRangeEventArgs) => {
        const currentItem = grid?.collectionView.items[args.row];
        if (args.col !== 0) {
          return;
        }
        const oldValue = args.data;
        grid.beginUpdate();
        const product = products.find((p: Partial<Product>) => {
          return p.code === currentItem.product?.code;
        });
        if (currentItem?.product?.code && !product) {
          grid.collectionView.items[args.row].product.code = oldValue;
          toast.error("商品が見つかりません");
          await new Promise((resolve) => setTimeout(resolve, 100));
          grid.select(args.row, args.col);
          grid.focus();
          grid.endUpdate();
          return;
        }
        currentItem.productId = product?.id ?? "";
        currentItem.product.name = product?.name ?? "";
        currentItem.product.price = product?.price ?? 0;
        currentItem.product.quantity = product?.quantity ?? 0;
        grid.endUpdate();
      }
    );
    grid?.columnFooters.rows.clear();
    grid?.columnFooters.rows.push(new GroupRow());
    grid?.bottomLeftCells.setCellData(0, 0, "合計");
  }, [grid, products]);

  useEffect(() => {
    createColumns().then(async () => {
      const params = new URLSearchParams(window.location.search);
      const orderNoParam = params.get("order-no");
      if (orderNoParam) {
        await getOrder(orderNoParam);
        grid?.select(0, 0);
        grid?.focus();
      } else {
        initializeOrderDetails();
      }
    });
  }, [grid]);

  const createColumns = async () => {
    const clients = await clietAppService.getClients();
    setClients(clients);
    await fetchProducts();
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const fetchProducts = async () => {
    const products = await productAppService.getProducts();
    setProducts(products);
  };

  const getOrder = async (orderNo: string) => {
    const order = await orderAppService.getOrder(orderNo);
    if (order) {
      setOrder(order);
      setOrderNo(order.orderNo);
      setSelectedClient(order.client);
      setOrderDetails(order.orderDetails);
      initializeOrderDetails(order.orderDetails);
    }
  };

  const initializeOrderDetails = (fetchOrderDetails?: OrderDetail[]) => {
    const orderDetails: OrderDetail[] = (
      fetchOrderDetails ?? Array(10).fill(null)
    ).map(
      (detail: OrderDetail | null) =>
        new OrderDetail(
          detail?.id ?? undefined,
          detail?.uid ?? undefined,
          detail?.operation ?? undefined,
          detail?.orderId ?? "",
          detail?.productId ?? "",
          detail?.product ??
            new Product(
              detail?.product?.id ?? "",
              detail?.product?.uid ?? undefined,
              detail?.product?.operation ?? undefined,
              detail?.product?.code ?? "",
              detail?.product?.name ?? "",
              detail?.product?.description ?? "",
              detail?.product?.price ?? 0,
              detail?.product?.quantity ?? 0,
              detail?.product?.category ?? "",
              detail?.product?.createdAt ?? new Date(),
              detail?.product?.updatedAt ?? new Date()
            ),
          detail?.quantity ?? 0,
          detail?.createdAt ?? new Date(),
          detail?.updatedAt ?? new Date()
        )
    );

    setOrderDetails(orderDetails);
    setCollectionView(
      new CollectionView(orderDetails, {
        refreshOnEdit: false,
        trackChanges: true,
        getError: undefined,
        calculatedFields: {
          subtotal: ($: OrderDetail) =>
            $.product ? $.product?.price * ($.quantity ?? 0) : 0,
        },
      })
    );
  };

  const onClientChanged = (sender: IComboBox) => {
    const client = clients.find((c) => c.name === sender.text);
    selectedClientRef.current = client ?? null;
    setTimeout(() => {
      setSelectedClient(selectedClientRef.current);
    }, 0);
    if (!client && clientAutoComplete) {
      clientAutoComplete.text = "";
    }
  };

  const onClientInitialized = (sender: IAutoComplete) => {
    if (sender) {
      sender.selectedIndex = -1;
      sender.text = "";
      sender.focus();
      setClientAutoComplete(sender);
    }
  };

  useEffect(() => {
    clientAutoComplete?.hostElement.addEventListener("keydown", (e) => {
      if (e.key === "F4") {
        showClientSearchDialog();
      }
    });
    setSelectedClient(null);
    selectedClientRef.current = null;
    if (clientAutoComplete) {
      clientAutoComplete.text = "";
    }
  }, [clients]);

  const onSalesDateChange = (value: Date | null) => {
    setSalesDate(value);
  };

  const registerOrder = async () => {
    if (!selectedClient) {
      toast.error("得意先を選択してください");
      return;
    }
    if (!grid?.collectionView.items.some((item) => item.operation)) {
      toast.error("明細は最低1件は入力してください");
      return;
    }
    if (!collectionView) {
      return;
    }
    collectionView.getError = getError;
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (grid?.hostElement.querySelector(".wj-state-invalid")) {
      toast.error("入力内容を確認してください");
      return;
    }
    grid?.collectionView.items.forEach((item, index) => {
      item.uid = index;
    });
    const details = collectionView?.items
      .filter((o) => o.operation)
      .map((o) =>
        OrderDetail.create(
          new OrderDetail(
            o.id ?? undefined,
            o.uid ?? 0,
            o.operation as Operation,
            o.orderId ?? "",
            o.productId ?? "",
            o.product as Product,
            o.quantity ?? 0,
            o.createdAt,
            o.updatedAt
          )
        )
      );
    const results = await orderAppService.createUpdate(
      new OrderEntity(
        order?.id ?? undefined,
        order?.uid ?? undefined,
        order?.operation ?? undefined,
        orderNo,
        salesDate ?? new Date(),
        selectedClient.id ?? "",
        selectedClient as Client,
        details ?? [],
        order?.createdAt ?? new Date(),
        order?.updatedAt ?? new Date()
      )
    );
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

    clearOrder({ isClearClient: false });
    toast.success("受注登録しました");
    await fetchProducts();
  };

  const deleteOrder = async () => {
    const result = await showDialog({
      title: "削除確認",
      description: "削除しますか？",
      confirmText: "削除",
      cancelText: "キャンセル",
    });
    if (result) {
      await orderAppService.deleteOrder(orderNo);
      clearOrder({ isClearClient: false });
      toast.success("削除しました");
    }
  };

  const clearOrder = (
    options: {
      isClearClient?: boolean;
    } = {}
  ) => {
    setOrder(null);
    setOrderNo("");
    setOrderDetails([]);
    if (clientAutoComplete && options.isClearClient) {
      setSelectedClient(null);
      clientAutoComplete.text = "";
    }
    initializeOrderDetails();
    grid?.select(0, 0);
    grid?.focus();
  };

  const showProductSearchDialog = () => {
    showWijmoDialog({
      title: "商品検索",
      content: (
        <ProductSearchDialog
          products={products}
          onSelect={(product) => {
            if (grid) {
              grid.collectionView.items[grid.selection.row].product.code =
                product.code;
            }
            grid?.onCellEditEnded(
              new CellRangeEventArgs(
                grid.cells,
                new CellRange(grid.selection.row, 0)
              )
            );
          }}
          onClose={handleClose}
        />
      ),
    });
  };

  const showClientSearchDialog = () => {
    showWijmoDialog({
      title: "得意先検索",
      content: (
        <ClientSearchDialog
          clients={clients}
          onSelect={setSelectedClient}
          onClose={handleClose}
        />
      ),
    });
  };
  return (
    <div className="bg-gray-50">
      <div className="p-6 flex">
        <div
          className={`transition-all duration-300 relative ${
            isGuideOpen ? "w-[calc(100%-450px)]" : "w-full pr-[40px]"
          }`}
        >
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                受注登録
              </h1>
              <p className="text-sm text-gray-600">
                受注情報の登録と編集ができます
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-base font-semibold text-gray-900">
                  ヘッダー
                </div>
              </div>
              <div className="flex flex-row gap-6 items-end mb-6">
                <div className="flex flex-row gap-4">
                  <div>
                    <TextInput
                      value={orderNo}
                      label="受注No"
                      isReadOnly={true}
                    />
                  </div>
                </div>
                <div className="form-group flex flex-col">
                  <label
                    htmlFor="salesDate"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    売上日
                  </label>
                  <InputDate
                    id="salesDate"
                    format="yyyy/MM/dd"
                    tabIndex={1}
                    valueChanged={(sender) => {
                      onSalesDateChange(sender.value);
                    }}
                    style={{ backgroundColor: "#f0fff4" }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => clearOrder({ isClearClient: true })}
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    伝票クリア(alt+n)
                  </Button>
                  {orderNo && (
                    <Button onClick={deleteOrder} variant="destructive">
                      伝票削除(alt+m)
                    </Button>
                  )}
                  <Button
                    onClick={registerOrder}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    {orderNo ? "更新" : "受注登録"}(alt+u)
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mb-6">
                <div>
                  <div className="form-group flex flex-col">
                    <label
                      htmlFor="theAutoComplete"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      得意先
                    </label>
                    {clients.length > 0 && (
                      <AutoComplete
                        id="clientAutoComplete"
                        displayMemberPath="name"
                        selectedValuePath="id"
                        placeholder="F4で検索"
                        tabOrder={2}
                        isReadOnly={false}
                        itemsSource={clients}
                        textChanged={onClientChanged}
                        initialized={onClientInitialized}
                        selectedValue={selectedClient?.id}
                        style={{ backgroundColor: "#f0fff4" }}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <TextInput
                    label="メールアドレス"
                    value={selectedClient?.email}
                    isReadOnly={true}
                  />
                </div>
                <div>
                  <TextInput
                    label="電話番号"
                    value={selectedClient?.phone}
                    isReadOnly={true}
                  />
                </div>
                <div>
                  <TextInput
                    label="郵便番号"
                    value={selectedClient?.postalCode}
                    isReadOnly={true}
                  />
                </div>
                <div>
                  <TextInput
                    label="都道府県"
                    value={selectedClient?.prefecture}
                    isReadOnly={true}
                  />
                </div>
                <div>
                  <TextInput
                    label="業種"
                    value={selectedClient?.businessType}
                    isReadOnly={true}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-base font-semibold text-gray-900">
                    明細
                  </div>
                </div>
                {columns && columns.length > 0 && (
                  <FlexGrid<OrderDetail>
                    tabOrder={3}
                    gridKey="受注明細"
                    columns={columns}
                    collectionView={collectionView}
                    originalItems={orderDetails}
                    grid={grid}
                    setGrid={setGrid}
                  />
                )}
              </div>
            </div>
          </div>
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

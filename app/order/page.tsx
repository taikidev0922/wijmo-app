"use client";
import { AutoComplete, InputDate } from "@mescius/wijmo.react.input";
import { AutoComplete as IAutoComplete } from "@mescius/wijmo.input";
import { ComboBox as IComboBox } from "@mescius/wijmo.input";
import {
  CellRangeEventArgs,
  GroupRow,
  FlexGrid as IFlexGrid,
} from "@mescius/wijmo.grid";
import { Aggregate, CollectionView } from "@mescius/wijmo";
import { ClientAppService } from "@/application/clientAppService";
import { ClientRepository } from "@/infrastructure/repository/clientRepository";
import { useEffect, useRef, useCallback } from "react";
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
export default function Order() {
  const { showDialog } = useDialog();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      header: "商品コード",
      binding: "product.code",
      dataType: "string",
    },
    {
      header: "商品名",
      binding: "product.name",
      dataType: "string",
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
  ]);

  useEffect(() => {
    if (products.length > 0) {
      const updatedColumns = columns.map((column) => {
        if (column.binding === "product.code") {
          return {
            ...column,
            editor: new IAutoComplete(document.createElement("div"), {
              itemsSource: products,
              displayMemberPath: "code",
              placeholder: "F4で検索",
            }),
          };
        }
        return column;
      });
      setColumns(updatedColumns);
    }
  }, []);

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
    grid?.cellEditEnded.addHandler(
      (sender: IFlexGrid, args: CellRangeEventArgs) => {
        grid.beginUpdate();
        const currentItem = grid.collectionView.items[args.row];
        const product = products.find((p: Partial<Product>) => {
          return p.code === currentItem.product?.code;
        });
        if (product) {
          currentItem.productId = product.id;
          currentItem.product.name = product.name;
          currentItem.product.price = product.price;
        }
        grid.endUpdate();
      }
    );
    grid?.columnFooters.rows.push(new GroupRow());
    grid?.bottomLeftCells.setCellData(0, 0, "合計");
  }, [grid]);
  useEffect(() => {
    createColumns().then(() => {
      const params = new URLSearchParams(window.location.search);
      const orderNoParam = params.get("order-no");
      if (orderNoParam) {
        getOrder(orderNoParam);
      } else {
        initializeOrderDetails();
      }
    });

    // Get order-no from URL if present
  }, []);

  const createColumns = async () => {
    const clients = await clietAppService.getClients();
    setClients([
      new Client(
        undefined,
        undefined,
        undefined,
        "",
        "",
        "",
        "",
        "",
        "",
        undefined,
        undefined
      ),
      ...clients,
    ]);
    const products = await productAppService.getProducts();
    setProducts(products);
    await new Promise((resolve) => setTimeout(resolve, 100));
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

  const onClientChanged = useCallback((sender: IComboBox) => {
    selectedClientRef.current = sender.selectedItem as Client;
    // Use setTimeout to defer the state update to the next tick
    setTimeout(() => {
      setSelectedClient(selectedClientRef.current);
    }, 0);
  }, []);

  const onClientInitialized = useCallback((sender: IAutoComplete) => {
    if (sender) {
      sender.selectedIndex = -1; // 明示的に選択を解除
      sender.text = ""; // テキストをクリア
      setClientAutoComplete(sender);
    }
  }, []);

  useEffect(() => {
    if (clientAutoComplete) {
      selectedClientRef.current = null;
      setSelectedClient(null);
    }
  }, []);

  const onSalesDateChange = (value: Date | null) => {
    setSalesDate(value);
  };

  const registerOrder = async () => {
    if (!selectedClient) {
      toast.error("得意先を選択してください");
      return;
    }
    const details = collectionView?.items
      .filter((o) => o.operation)
      .map((o, index) =>
        OrderDetail.create(
          new OrderDetail(
            o.id ?? undefined,
            index,
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
    orderAppService.createUpdate(
      new OrderEntity(
        order?.id ?? undefined,
        orderNo,
        salesDate ?? new Date(),
        selectedClient.id ?? "",
        selectedClient as Client,
        details ?? [],
        order?.createdAt ?? new Date(),
        order?.updatedAt ?? new Date()
      )
    );
    clearOrder({ isClearClient: false });
    toast.success("受注登録しました");
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
    setOrderNo("");
    setSelectedClient(null);
    setOrderDetails([]);
    if (clientAutoComplete && options.isClearClient) {
      clientAutoComplete.text = "";
    }
    initializeOrderDetails();
    grid?.select(0, 0);
    grid?.focus();
  };

  return (
    <div>
      <div className="flex flex-row gap-4 items-end">
        <div className="flex flex-row gap-4">
          <div>
            <TextInput value={orderNo} label="受注No" isReadOnly={true} />
          </div>
        </div>
        <div className="form-group flex flex-col">
          <label htmlFor="salesDate">売上日</label>
          <InputDate
            id="salesDate"
            format="yyyy/MM/dd"
            valueChanged={(sender) => {
              onSalesDateChange(sender.value);
            }}
            style={{ backgroundColor: "white" }}
          />
        </div>
        <Button
          onClick={() => clearOrder({ isClearClient: true })}
          className="bg-orange-500 text-white"
        >
          伝票クリア
        </Button>
        {orderNo && (
          <Button onClick={deleteOrder} className="bg-red-500 text-white">
            伝票削除
          </Button>
        )}
        <Button onClick={registerOrder} className="bg-blue-500 text-white">
          {orderNo ? "更新" : "受注登録"}
        </Button>
      </div>
      <div className="flex flex-row gap-4 border pt-4">
        <div>得意先情報</div>
        <div className="flex flex-col form-group">
          <label htmlFor="theAutoComplete">得意先</label>
          <div>
            {clients.length > 0 && (
              <AutoComplete
                id="clientAutoComplete"
                displayMemberPath="name"
                selectedValuePath="id"
                isReadOnly={false}
                itemsSource={clients}
                textChanged={onClientChanged}
                initialized={onClientInitialized}
                selectedValue={selectedClient?.id}
                style={{ backgroundColor: "white" }}
              />
            )}
          </div>
        </div>
        <TextInput
          label="メールアドレス"
          value={selectedClient?.email}
          isReadOnly={true}
        />
        <TextInput
          label="電話番号"
          value={selectedClient?.phone}
          isReadOnly={true}
        />
        <TextInput
          label="郵便番号"
          value={selectedClient?.postalCode}
          isReadOnly={true}
        />
        <TextInput
          label="都道府県"
          value={selectedClient?.prefecture}
          isReadOnly={true}
        />
        <TextInput
          label="業種"
          value={selectedClient?.businessType}
          isReadOnly={true}
        />
      </div>
      <div className="flex flex-row gap-4 border pt-4">
        <div>明細</div>
        {columns.length > 0 && (
          <FlexGrid<OrderDetail>
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
  );
}

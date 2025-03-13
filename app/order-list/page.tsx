"use client";
import { OrderAppService } from "@/application/orderAppService";
import {
  FlexGrid,
  FlexGridCellTemplate,
  FlexGridColumn,
} from "@mescius/wijmo.react.grid";
import { OrderRepository } from "@/infrastructure/repository/orderRepository";
import { Order } from "@/domains/order";
import { useEffect, useState } from "react";
import { FlexGrid as IFlexGrid } from "@mescius/wijmo.grid";
import { CollectionView } from "@mescius/wijmo";
import { FlexGridFilter } from "@mescius/wijmo.react.grid.filter";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OrderListPage() {
  const orderAppService = new OrderAppService(new OrderRepository());
  const [grid, setGrid] = useState<IFlexGrid>();
  const [collectionView, setCollectionView] = useState<CollectionView<Order>>();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await orderAppService.getOrders();
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

  return (
    <div>
      <div>受注一覧</div>
      <Button onClick={showOrder}>受注伝票表示</Button>
      <FlexGrid
        isReadOnly={true}
        initialized={setGrid}
        itemsSource={collectionView}
        style={{ height: "70vh" }}
      >
        <FlexGridFilter />
        <FlexGridCellTemplate
          cellType="RowHeader"
          template={(ctx) => ctx.row.index + 1}
        />
        <FlexGridColumn header="受注No" binding="orderNo" />
        <FlexGridColumn header="受注日" binding="orderDate" />
        <FlexGridColumn header="得意先" binding="client.name" />
        <FlexGridColumn header="合計金額" binding="totalAmount" />
      </FlexGrid>
    </div>
  );
}

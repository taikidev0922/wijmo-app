import { FlexGrid } from "@mescius/wijmo.react.grid";
import { Product } from "@/domains/product";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { FlexGrid as IFlexGrid } from "@mescius/wijmo.grid";
import { CollectionView } from "@mescius/wijmo";
import { FlexGridFilter } from "@mescius/wijmo.react.grid.filter";
import { TextInput } from "../TextInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductSearchDialogProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

interface ProductSearchConditions {
  code: string;
  name: string;
  quantityFrom: string;
  quantityTo: string;
  priceFrom: string;
  priceTo: string;
}

export function ProductSearchDialog({
  products,
  onSelect,
  onClose,
}: ProductSearchDialogProps) {
  const [grid, setGrid] = useState<IFlexGrid>();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const searchConditions = useRef<ProductSearchConditions>({
    code: "",
    name: "",
    quantityFrom: "",
    quantityTo: "",
    priceFrom: "",
    priceTo: "",
  });

  const columns = [
    {
      header: "商品コード",
      binding: "code",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "商品名",
      binding: "name",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "在庫数",
      binding: "quantity",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "単価(円)",
      binding: "price",
      cssClass: "read-only-cell",
      width: "*",
    },
  ];
  useEffect(() => {
    searchProducts("name", searchConditions.current.name);
  }, [products]);

  const handleSelect = () => {
    if (grid) {
      const item = grid.collectionView.currentItem;
      onSelect(item);
      onClose();
    }
  };

  const searchProducts = (
    key: keyof ProductSearchConditions,
    value: string
  ) => {
    searchConditions.current[key] = value;

    const filtered = products.filter((product) => {
      const codeMatch =
        !searchConditions.current.code ||
        product.code
          .toLowerCase()
          .includes(searchConditions.current.code.toLowerCase());

      const nameMatch =
        !searchConditions.current.name ||
        product.name
          .toLowerCase()
          .includes(searchConditions.current.name.toLowerCase());

      const quantityFrom = searchConditions.current.quantityFrom
        ? Number(searchConditions.current.quantityFrom)
        : null;
      const quantityTo = searchConditions.current.quantityTo
        ? Number(searchConditions.current.quantityTo)
        : null;
      const quantityMatch =
        (!quantityFrom || product.quantity >= quantityFrom) &&
        (!quantityTo || product.quantity <= quantityTo);

      const priceFrom = searchConditions.current.priceFrom
        ? Number(searchConditions.current.priceFrom)
        : null;
      const priceTo = searchConditions.current.priceTo
        ? Number(searchConditions.current.priceTo)
        : null;
      const priceMatch =
        (!priceFrom || product.price >= priceFrom) &&
        (!priceTo || product.price <= priceTo);

      return codeMatch && nameMatch && quantityMatch && priceMatch;
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <Card className="mb-4">
        <CardHeader className="p-4">
          <CardTitle>検索条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <TextInput
              key="code"
              label="商品コード"
              onChange={(value) => searchProducts("code", value)}
            />
            <TextInput
              key="name"
              label="商品名"
              onChange={(value) => searchProducts("name", value)}
            />
            <div className="flex gap-2 items-center">
              <TextInput
                key="quantityFrom"
                label="在庫数(From)"
                onChange={(value) => searchProducts("quantityFrom", value)}
              />
              <span className="mt-6">～</span>
              <TextInput
                key="quantityTo"
                label="在庫数(To)"
                onChange={(value) => searchProducts("quantityTo", value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <TextInput
                key="priceFrom"
                label="単価(From)"
                onChange={(value) => searchProducts("priceFrom", value)}
              />
              <span className="mt-6">～</span>
              <TextInput
                key="priceTo"
                label="単価(To)"
                onChange={(value) => searchProducts("priceTo", value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <FlexGrid
          itemsSource={new CollectionView(filteredProducts)}
          columns={columns}
          headersVisibility="Column"
          selectionMode="Row"
          initialized={(grid: IFlexGrid) => setGrid(grid)}
          style={{ height: "50vh" }}
        >
          <FlexGridFilter />
        </FlexGrid>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSelect} className="bg-blue-500 text-white">
            決定
          </Button>
        </div>
      </div>
    </div>
  );
}

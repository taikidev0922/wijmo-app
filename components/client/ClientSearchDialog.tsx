import { FlexGrid } from "@mescius/wijmo.react.grid";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { FlexGrid as IFlexGrid } from "@mescius/wijmo.grid";
import { CollectionView } from "@mescius/wijmo";
import { FlexGridFilter } from "@mescius/wijmo.react.grid.filter";
import { Client } from "@/domains/client";
import { TextInput } from "../TextInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComboBox } from "@/components/ComboBox";
import { prefectureMap } from "@/datas/prefectures";
import { businessTypeMap } from "@/datas/businessTypes";

interface ClientSearchDialogProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onClose: () => void;
}

interface ClientSearchConditions {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  businessType: string;
}

export function ClientSearchDialog({
  clients,
  onSelect,
  onClose,
}: ClientSearchDialogProps) {
  const [grid, setGrid] = useState<IFlexGrid>();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const searchConditions = useRef<ClientSearchConditions>({
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    prefecture: "",
    businessType: "",
  });
  const columns = [
    {
      header: "得意先名",
      binding: "name",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "メールアドレス",
      binding: "email",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "電話番号",
      binding: "phone",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "郵便番号",
      binding: "postalCode",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "都道府県",
      binding: "prefecture",
      cssClass: "read-only-cell",
      width: "*",
    },
    {
      header: "業種",
      binding: "businessType",
      cssClass: "read-only-cell",
      width: "*",
    },
  ];

  useEffect(() => {
    searchClients("name", searchConditions.current.name);
  }, [clients]);

  const handleSelect = () => {
    if (grid) {
      const item = grid.collectionView.currentItem;
      onSelect(item);
      onClose();
    }
  };

  const searchClients = (key: keyof ClientSearchConditions, value: string) => {
    searchConditions.current[key] = value;

    const filtered = clients.filter((client) => {
      return Object.keys(searchConditions.current).every((key) => {
        return client[key as keyof Client]
          ?.toString()
          .includes(
            searchConditions.current[key as keyof ClientSearchConditions]
          );
      });
    });

    setFilteredClients(filtered);
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <Card className="mb-4">
        <CardHeader className="p-4">
          <CardTitle>検索条件</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="flex flex-wrap gap-4">
            <TextInput
              label="得意先名"
              onChange={(value) => searchClients("name", value)}
            />
            <TextInput
              label="メールアドレス"
              onChange={(value) => searchClients("email", value)}
            />
            <TextInput
              label="電話番号"
              onChange={(value) => searchClients("phone", value)}
            />
            <TextInput
              label="郵便番号"
              onChange={(value) => searchClients("postalCode", value)}
            />
            <ComboBox
              label="都道府県"
              itemsSource={prefectureMap}
              onChange={(value) => searchClients("prefecture", value)}
            />
            <ComboBox
              label="業種"
              itemsSource={businessTypeMap}
              onChange={(value) => searchClients("businessType", value)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <FlexGrid
          isReadOnly={true}
          itemsSource={new CollectionView(filteredClients)}
          columns={columns}
          headersVisibility="Column"
          selectionMode="Row"
          initialized={(grid: IFlexGrid) => setGrid(grid)}
          style={{ height: "50vh" }}
        >
          <FlexGridFilter />
        </FlexGrid>
        <div className="flex justify-end gap-2 h-8">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSelect}>決定</Button>
        </div>
      </div>
    </div>
  );
}

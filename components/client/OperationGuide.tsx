import { Card } from "@/components/ui/card";
import Image from "next/image";

interface GuideItem {
  title: string;
  description: string;
  shortcut?: string;
  image?: string;
}

export function OperationGuide() {
  const guides: GuideItem[] = [
    {
      title: "データの再取得",
      description:
        "ブラウザ内のローカルDBから最新のデータを取得します。編集中のデータがある場合は確認ダイアログが表示されます。",
      shortcut: "Alt + R",
    },
    {
      title: "一括更新",
      description:
        "編集したデータをブラウザ内のローカルDBに保存します。入力エラーがある場合は保存できません。対象となるデータは操作区分として[U I D]が設定されているデータです。\nU:更新 I:追加 D:削除",
      shortcut: "Alt + U",
      image: "/iud.png",
    },
    {
      title: "データの編集",
      description:
        "セルをダブルクリックまたはF2キーで編集モードに入ります。\nセルにフォーカスがある状態で文字を入力しても編集モードになります。",
      shortcut: "F2",
    },
    {
      title: "編集の確定",
      description:
        "EnterまたはTabキーで編集を確定します。\nEnterは下のセル、Tabは次の編集可能なセルに移動します。",
      shortcut: "Enter, Tab",
    },
    {
      title: "編集のキャンセル",
      description: "Escキーで編集をキャンセルします。",
      shortcut: "Esc",
    },
    {
      title: "セル移動",
      description: "矢印キーでセル間を移動できます。",
      shortcut: "↑↓←→",
    },
    {
      title: "フィルター",
      description: "フィルターを適用してデータを絞り込みます。",
      shortcut: "alt+↓",
    },
  ];

  return (
    <div className="space-y-4">
      {guides.map((guide, index) => (
        <Card key={index} className="p-4">
          <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
          <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">
            {guide.description}
          </p>
          {guide.image && (
            <div className="mb-2">
              <Image
                src={guide.image}
                alt={guide.title}
                width={500}
                height={300}
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
          {guide.shortcut && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">ショートカット:</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                {guide.shortcut}
              </kbd>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

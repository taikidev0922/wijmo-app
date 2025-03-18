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
      shortcut: "Alt + Y",
    },
    {
      title: "一括更新",
      description:
        "編集したデータをブラウザ内のローカルDBに保存します。入力エラーがある場合は保存できません。対象となるデータは操作区分として[U I D]が設定されているデータです。\nU:更新 I:追加 D:削除",
      shortcut: "Alt + U",
      image: "/iud.png",
    },
    {
      title: "行追加",
      description: "新しい行を追加します。",
      shortcut: "Alt + ;",
    },
    {
      title: "行コピー",
      description: "選択中の行をコピーして新しい行を追加します。",
      shortcut: "Alt + H",
    },
    {
      title: "行削除",
      description:
        "選択中の行を削除します。既存データの場合は論理削除、新規データの場合は物理削除となります。",
      shortcut: "Alt + J",
    },
    {
      title: "取消",
      description: "選択中の行の編集内容を取り消します。",
      shortcut: "Alt + K",
    },
    {
      title: "レイアウト保存",
      description: "現在の列の並び順や幅などのレイアウトを保存します。",
      shortcut: "Alt + L",
    },
    {
      title: "Excel出力",
      description: "現在の表示内容をExcelファイルとして出力します。",
      shortcut: "Alt + I",
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
        "編集内容の確定と同時にセル移動を行います。\n・Enterキー：編集を確定し、下のセルに移動します。\n・Tabキー：編集を確定し、右隣の編集可能なセルに移動します。編集可能なセルが見つかるまで右方向に探索し、行末まで到達した場合は次の行の先頭から探索します。",
      shortcut: "Enter, Tab",
    },
    {
      title: "編集のキャンセル",
      description: "Escキーで編集をキャンセルします。",
      shortcut: "Esc",
    },
    {
      title: "セル移動",
      description:
        "以下のキーでセル間を移動できます：\n・↑（上矢印）：上のセルに移動\n・↓（下矢印）：下のセルに移動\n・←（左矢印）：左のセルに移動\n・→（右矢印）：右のセルに移動\n・Tab：次の編集可能なセルに移動\n・Enter：下のセルに移動",
      shortcut: "↑↓←→, Tab, Enter",
    },
    {
      title: "バリデーションエラー",
      description:
        "入力値の検証は一括更新時に行われます：\n・必須項目チェック：違反している場合は対象セルに赤枠が表示されます。\n・文字数制限などの入力規則：違反している場合は対象セルに赤枠が表示されます。\n\nエラーの解消方法：\n・適切な値を入力して確定することで、エラー表示（赤枠）は自動的に消えます。\n・全てのエラーが解消されるまで一括更新は実行できません。",
      image: "/validation-error1.png",
    },
    {
      title: "フィルター",
      description: "フィルターを適用してデータを絞り込みます。",
      shortcut: "Alt + ↓",
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

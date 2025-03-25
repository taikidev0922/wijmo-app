import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideStep {
  title: string;
  description: string;
  image?: string;
  tips?: string[];
  shortcuts?: { key: string; description: string }[];
  images?: { src: string; alt: string; caption: string }[];
}

export function OperationGuide() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: GuideStep[] = [
    {
      title: "1. データの編集",
      description:
        "編集したいセルを選択して値を入力してみましょう。編集した行には「U」(Update)アイコンが表示され、更新対象であることを示します。",
      image: "/guide-images/u-icon.png",
      tips: [
        "セルをダブルクリックまたはF2キーで編集モードに入れます",
        "編集中のセルでEnterキーを押すと下のセルに移動します",
        "Tabキーを押すと右のセルに移動します",
      ],
    },
    {
      title: "2. 新規データの追加",
      description:
        "行追加ボタンまたは行コピーボタンで新しい行を追加できます。追加された行には「I」(Insert)アイコンが表示されます。行コピーの場合は、選択中の行のデータ（会社名以外）がコピーされます。",
      image: "/guide-images/i-icon.png",
      shortcuts: [
        { key: "Alt + ;", description: "行追加" },
        { key: "Alt + H", description: "行コピー" },
      ],
    },
    {
      title: "3. データの削除",
      description:
        "削除したい行を選択して行削除ボタンを押すと、「D」(Delete)アイコンが表示されます。一括更新実行時にその行は削除されます。",
      image: "/guide-images/d-icon.png",
      shortcuts: [{ key: "Alt + J", description: "行削除" }],
    },
    {
      title: "4. 一括更新の実行",
      description:
        "編集(U)、追加(I)、削除(D)のアイコンが付いた行は更新対象です。一括更新ボタンを押すと、全ての変更が一度に反映されます。",
      image: "/guide-images/bulk-update-button.png",
      shortcuts: [{ key: "Alt + U", description: "一括更新" }],
    },
    {
      title: "5. エラー処理",
      description:
        "エラーには2種類あります：\n1. バリデーションエラー：入力値の検証時に発生するエラーです。エラーのあるセルは赤枠で表示され、カーソルを当てるとエラー内容を確認できます。\n2. データ整合性エラー：サーバーでの処理時に発生するエラーです。行ヘッダにエラーアイコンが表示され、クリックするとエラー内容を確認できます。\n\n実際に試してみましょう：\n• バリデーションエラーを発生させる：\n  1. 価格のセルを選択\n  2. マイナスの値（例：-1000）を入力\n  3. 一括更新ボタンを押す\n  → セルが赤枠で表示され、「0以上の価格を入力してください」というエラーが確認できます\n\n• データ整合性エラーを発生させる：\n  1. 商品コードのセルを選択\n  2. 既に存在する他の商品コードと同じコードを入力\n  3. 一括更新ボタンを押す\n  → 行ヘッダにエラーアイコンが表示され、クリックするとエラーダイアログが開きます",
      images: [
        {
          src: "/guide-images/more-than-zero.png",
          alt: "バリデーションエラー",
          caption:
            "バリデーションエラー：セルが赤枠で表示され、カーソルを当てるとエラー内容を確認できます",
        },
        {
          src: "/guide-images/product-error-icon.png",
          alt: "データ整合性エラー",
          caption: "データ整合性エラー：行ヘッダにエラーアイコンが表示されます",
        },
        {
          src: "/guide-images/error-dialog.png",
          alt: "エラーダイアログ",
          caption: "エラーアイコンをクリックすると、エラー内容を確認できます",
        },
      ],
      tips: [
        "バリデーションエラーは一括更新前に全て解消する必要があります",
        "価格と在庫数は0以上の値を入力する必要があります",
        "商品コードは重複できません",
        "必須項目は空欄にできません",
        "データ整合性エラーが発生した行は、エラー内容を確認して修正してください",
      ],
    },
    {
      title: "6. 編集の取り消し",
      description:
        "編集した内容を元に戻したい場合は、対象の行で取消ボタンを押してください。新規追加した行の場合は行自体が削除されます。",
      image: "/guide-images/back-button.png",
      shortcuts: [{ key: "Alt + K", description: "取消" }],
    },
    {
      title: "7. レイアウトのカスタマイズ",
      description:
        "列の幅を変更したり、列の順序を入れ替えたりしてお好みのレイアウトに調整できます。レイアウト保存ボタンを押すと、次回同じレイアウトで表示されます。",
      image: "/guide-images/save-layout-button.png",
      tips: [
        "列ヘッダーの端をドラッグして幅を調整",
        "列ヘッダーをドラッグ＆ドロップで順序を変更",
        "保存したレイアウトはブラウザを閉じても維持されます",
      ],
      shortcuts: [{ key: "Alt + L", description: "レイアウト保存" }],
    },
    {
      title: "8. データの絞り込みと並び替え",
      description:
        "列ヘッダーのフィルターボタンを使って条件に合うデータを絞り込んだり、クリックしてデータを並び替えたりできます。",
      image: "/guide-images/filter-dialog.png",
      tips: [
        "複数の条件を組み合わせたフィルタリングが可能",
        "列ヘッダーをクリックする度に昇順・降順が切り替わります",
        "フィルター条件はExcel形式で詳細な設定が可能",
      ],
    },
    {
      title: "9. Excel出力",
      description:
        "表示中のデータをExcelファイルとして出力できます。フィルターで絞り込んだ状態のデータもそのままExcelに出力されます。",
      image: "/guide-images/excel-output.png",
      shortcuts: [{ key: "Alt + I", description: "Excel出力" }],
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          前へ
        </Button>
        <span className="text-sm text-gray-500">
          {currentStep + 1} / {steps.length}
        </span>
        <Button
          variant="outline"
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="gap-2"
        >
          次へ
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current step content */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">{steps[currentStep].title}</h2>
        <p className="text-gray-600 mb-6 whitespace-pre-wrap">
          {steps[currentStep].description}
        </p>

        {/* Image section */}
        {steps[currentStep].images ? (
          <div className="space-y-4 mb-6">
            {steps[currentStep].images.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative w-full min-h-[200px] h-auto max-h-[400px] bg-gray-100 rounded-lg">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {image.caption}
                </p>
              </div>
            ))}
          </div>
        ) : steps[currentStep].image ? (
          <div className="relative w-full min-h-[200px] h-auto max-h-[400px] bg-gray-100 rounded-lg mb-6">
            <Image
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : (
          <div className="relative w-full h-[200px] bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            <span className="text-gray-400">画像がここに表示されます</span>
          </div>
        )}

        {/* Tips */}
        {steps[currentStep].tips && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="list-disc list-inside space-y-2">
              {steps[currentStep].tips.map((tip, index) => (
                <li key={index} className="text-gray-600 text-sm">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Shortcuts */}
        {steps[currentStep].shortcuts && (
          <div>
            <h3 className="font-semibold mb-2">ショートカット</h3>
            <div className="space-y-2">
              {steps[currentStep].shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                    {shortcut.key}
                  </kbd>
                  <span className="text-sm text-gray-600">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Step indicators */}
      <div className="flex gap-2 justify-center">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentStep === index
                ? "bg-blue-600 w-4"
                : "bg-gray-200 hover:bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}

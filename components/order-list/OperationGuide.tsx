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
      title: "1. 受注データの表示",
      description:
        "受注一覧画面では、登録されている全ての受注データを確認できます。\n\n表示される情報：\n• 受注No：受注を一意に識別する番号\n• 受注日：受注を受けた日付\n• 得意先：受注した得意先の名称\n• 合計金額：受注明細の合計金額\n\n※ この画面では受注データの編集はできません。編集が必要な場合は、対象の受注を選択して受注伝票表示を行ってください。\n\n【データの並び替え】\n• 列ヘッダーをクリックすると、その列で昇順/降順に並び替えができます\n• 再度クリックすると並び順が切り替わります\n\n【データの絞り込み】\n• 列ヘッダーのフィルターボタンをクリックしてフィルター条件を設定できます\n• 複数の条件を組み合わせることも可能です",
      tips: [
        "一覧のデータは編集できません（参照専用です）",
        "データの並び替えは列ヘッダーをクリックして行えます",
        "フィルター機能で条件に合う受注データを絞り込めます",
        "フィルター条件は複数の列で設定できます",
        "並び替えとフィルターを組み合わせて使用できます",
      ],
    },
    {
      title: "2. 受注伝票の表示",
      description:
        "登録済みの受注内容を確認・編集する手順：\n\n1. 一覧から対象の受注データを選択（クリック）\n2. 「受注伝票表示」ボタンをクリック、または alt+v キーを押す\n3. 選択した受注の詳細画面が開きます\n\n受注伝票画面では以下の操作が可能です：\n• 受注内容の確認\n• データの修正\n• 受注の削除",
      images: [
        {
          src: "/guide-images/show-order-button.png",
          alt: "受注伝票表示",
          caption:
            "受注伝票表示ボタンをクリックすると、選択した受注の詳細画面が開きます",
        },
      ],
      shortcuts: [{ key: "Alt + V", description: "受注伝票表示" }],
      tips: [
        "一覧で受注をダブルクリックしても伝票を表示できます",
        "伝票画面で修正した内容は一覧に即時反映されます",
      ],
    },
    {
      title: "3. 請求書の出力",
      description:
        "選択した受注データの請求書をPDFで出力する手順：\n\n1. 一覧から対象の受注データを選択（クリック）\n2. 「請求書出力」ボタンをクリック、または alt+p キーを押す\n3. PDFが生成され、自動的にダウンロードされます",
      images: [
        {
          src: "/guide-images/invoice-button.png",
          alt: "請求書出力",
          caption:
            "請求書出力ボタンをクリックすると、選択中の受注データの請求書PDFが生成されます",
        },
      ],
      shortcuts: [{ key: "Alt + P", description: "請求書出力" }],
      tips: [
        "請求書を出力するには受注データを選択する必要があります",
        "生成されたPDFは印刷や保存が可能です",
      ],
    },
    {
      title: "4. レイアウトのカスタマイズ",
      description:
        "一覧の表示をカスタマイズできます：\n\n• 列の幅を変更：列ヘッダーの端をドラッグ\n• 列の順序を変更：列ヘッダーをドラッグ＆ドロップ\n• レイアウト保存：変更した列幅や順序を保存",
      images: [
        {
          src: "/guide-images/save-layout-button.png",
          alt: "レイアウト保存",
          caption:
            "カスタマイズしたレイアウトは保存ボタンをクリックして次回以降も利用できます",
        },
      ],
      shortcuts: [{ key: "Alt + L", description: "レイアウト保存" }],
      tips: [
        "列の幅は自由に調整できます",
        "列の順序は必要に応じて変更できます",
        "保存したレイアウトは次回起動時も維持されます",
      ],
    },
    {
      title: "5. Excel出力",
      description:
        "表示中の受注一覧をExcelファイルとして出力できます：\n\n1. Excel出力ボタンをクリック、または alt+i キーを押す\n2. Excelファイルが自動的にダウンロードされます\n\n※ フィルターで絞り込んだ状態のデータもそのままExcelに出力されます。",
      images: [
        {
          src: "/guide-images/excel-output.png",
          alt: "Excel出力",
          caption:
            "Excel出力ボタンをクリックすると、表示中の受注一覧がExcelファイルとして出力されます",
        },
      ],
      shortcuts: [{ key: "Alt + I", description: "Excel出力" }],
      tips: [
        "現在表示中のデータのみが出力されます",
        "出力されるExcelファイルには列の書式が適用されます",
        "フィルター適用後の状態でも出力可能です",
      ],
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

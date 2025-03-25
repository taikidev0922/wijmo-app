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
      title: "1. 受注情報の入力",
      description:
        "受注情報を入力します。\n\n1. 売上日を選択\n2. 得意先を選択\n   • 得意先欄に名前の一部（例：「山田」）を入力すると、該当する候補が表示されます\n   • 候補から選択するか、F4キーを押して検索ダイアログを開くこともできます\n\n得意先を選択すると、メールアドレス、電話番号、郵便番号、都道府県、業種が自動的に表示されます。",
      images: [
        {
          src: "/guide-images/auto-complete.png",
          alt: "得意先の入力補完",
          caption: "得意先名を一部入力すると、該当する候補が表示されます",
        },
        {
          src: "/guide-images/client-dialog.png",
          alt: "得意先検索ダイアログ",
          caption:
            "F4キーで検索ダイアログを開くと、以下の操作が可能です：\n\n• ヘッダー部分をドラッグしてダイアログを移動\n• 端をドラッグしてサイズを変更\n• 検索条件を入力して絞り込み\n• 後ろの画面を確認しながら検索・選択",
        },
      ],
      tips: [
        "得意先名を一部入力すると候補が表示されます",
        "表示された候補から選択できます",
        "F4キーで検索ダイアログを開けます",
        "検索ダイアログは自由に移動できます",
        "ダイアログのサイズを変更できます",
        "複数の条件で絞り込み検索が可能です",
        "得意先情報は自動的に表示されます",
      ],
    },
    {
      title: "2. 明細の入力",
      description:
        "商品コードを入力して明細を登録します。\n\n1. 商品コードのセルを選択\n2. 商品コードを入力（F4キーで検索ダイアログを開けます）\n3. 数量を入力\n\n商品コードを入力すると、以下の項目が自動的に表示されます：\n• 商品名\n• 在庫数\n• 単価\n• 小計（数量×単価）\n\n※ 明細の基本的な操作方法（データの編集、行の追加・削除、並び替え、フィルターなど）については、得意先マスタや商品マスタの画面と同じです。詳しい操作方法はそちらを参照してください。",
      images: [
        {
          src: "/guide-images/order-details.png",
          alt: "受注明細",
          caption:
            "商品コードを入力すると、商品情報が自動的に表示され、数量に応じて小計が計算されます",
        },
      ],
      tips: [
        "商品コードは一部を入力して選択できます",
        "F4キーで商品検索ダイアログを開けます",
        "在庫数を超える数量は入力できません",
        "小計は自動的に計算されます",
        "明細の基本操作は得意先・商品マスタと共通です",
      ],
    },
    {
      title: "3. 受注の登録・更新",
      description:
        "受注の登録・更新は以下の手順で行います：\n\n【新規登録の場合】\n1. 内容を確認\n2. 受注登録/更新ボタン（alt+u）をクリック\n\n【更新の場合】\n1. 受注一覧画面で対象の受注データを選択\n2. 「受注伝票表示」ボタンをクリック\n3. 受注伝票画面で内容を修正\n4. 受注登録/更新ボタン（alt+u）をクリック",
      images: [
        {
          src: "/guide-images/order-register.png",
          alt: "受注登録",
          caption:
            "受注登録/更新ボタンをクリックすると、入力した内容が登録されます",
        },
      ],
      shortcuts: [{ key: "Alt + U", description: "受注登録/更新" }],
      tips: [
        "最低1件以上の明細が必要です",
        "得意先の選択は必須です",
        "売上日は必須です",
        "更新は受注一覧画面から対象データを選択して行います",
      ],
    },
    {
      title: "4. 受注の削除",
      description:
        "登録済みの受注を削除する手順は以下の通りです：\n\n1. 受注一覧画面で対象の受注データを選択\n2. 「受注伝票表示」ボタンをクリック\n3. 受注伝票画面で伝票削除ボタン（alt+m）をクリック\n4. 確認ダイアログで「削除」を選択",
      images: [
        {
          src: "/guide-images/order-delete.png",
          alt: "受注削除",
          caption:
            "伝票削除ボタンをクリックすると、確認ダイアログが表示されます",
        },
      ],
      shortcuts: [{ key: "Alt + M", description: "伝票削除" }],
      tips: [
        "削除は取り消しできないので注意してください",
        "削除は受注一覧画面から対象データを選択して行います",
      ],
    },
    {
      title: "5. 新規入力",
      description:
        "新しい受注を入力する場合は、伝票クリアボタンをクリックします。\n\n1. 伝票クリアボタン（alt+n）をクリック\n2. 全ての項目がクリアされ、新規入力状態になります",
      images: [
        {
          src: "/guide-images/order-clear.png",
          alt: "伝票クリア",
          caption:
            "伝票クリアボタンをクリックすると、入力内容がクリアされ新規入力状態になります",
        },
      ],
      shortcuts: [{ key: "Alt + N", description: "伝票クリア" }],
      tips: [
        "編集中の内容は失われるので注意してください",
        "得意先情報もクリアされます",
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

"use client";

import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DashboardService,
  MonthlyOrderAmount,
  CategorySales,
  BusinessTypeCount,
  LowStockProduct,
  YearlyOrderAmount,
  TimeUnit,
} from "@/application/dashboardService";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDatabase, generateDummyData } from "@/infrastructure/db";
import { useDialog } from "@/contexts/DialogContext";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C43",
];

export default function Home() {
  const [dashboardService] = useState(() => new DashboardService());
  const [orderAmounts, setOrderAmounts] = useState<
    MonthlyOrderAmount[] | YearlyOrderAmount[]
  >([]);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("month");
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [businessTypeCounts, setBusinessTypeCounts] = useState<
    BusinessTypeCount[]
  >([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTwoColumns, setIsTwoColumns] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showDialog } = useDialog();

  const handleResetDB = async () => {
    await resetDatabase();
    await generateDummyData();
    window.location.reload();
  };

  const handleClearDB = async () => {
    await resetDatabase();
    window.location.reload();
  };

  const handleCreateDummyData = async () => {
    await generateDummyData();
    window.location.reload();
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [orderData, categoryData, businessTypeData, lowStockData] =
        await Promise.all([
          dashboardService.getMonthlyOrderAmounts(timeUnit),
          dashboardService.getCategorySales(),
          dashboardService.getBusinessTypeCounts(),
          dashboardService.getLowStockProducts(),
        ]);

      setOrderAmounts(orderData);
      setCategorySales(categoryData);
      setBusinessTypeCounts(businessTypeData);
      setLowStockProducts(lowStockData);

      if (
        orderData.length === 0 &&
        categoryData.length === 0 &&
        businessTypeData.length === 0 &&
        lowStockData.length === 0
      ) {
        const confirmed = await showDialog({
          title: "データの初期化",
          description:
            "ダッシュボードを表示するには、まずダミーデータを作成する必要があります。サンプルデータを生成しますか？",
          confirmText: "ダミーデータを作成",
        });
        if (confirmed) {
          await handleCreateDummyData();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeUnit]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setIsTwoColumns(width >= 1200);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="p-6">
        <div
          ref={containerRef}
          className={`transition-all duration-300 ${
            isGuideOpen ? "mr-[450px]" : "mr-[40px]"
          }`}
        >
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                架空の受注システム
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                システムの主要な指標を確認できます
              </p>
            </div>
            <div className="space-x-3">
              <Button onClick={handleResetDB}>DBダミーデータ作成</Button>
              <Button variant="destructive" onClick={handleClearDB}>
                DBを空にする
              </Button>
            </div>
          </div>

          <div
            className={`grid ${
              isTwoColumns ? "grid-cols-2" : "grid-cols-1"
            } gap-6`}
          >
            {/* 月別受注金額推移 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {timeUnit === "month" ? "月別" : "年別"}受注金額推移
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant={timeUnit === "month" ? "default" : "outline"}
                    onClick={() => setTimeUnit("month")}
                    className="text-sm"
                  >
                    月別
                  </Button>
                  <Button
                    variant={timeUnit === "year" ? "default" : "outline"}
                    onClick={() => setTimeUnit("year")}
                    className="text-sm"
                  >
                    年別
                  </Button>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={isLoading ? [] : orderAmounts}
                    key={`${timeUnit}-${orderAmounts.length}`}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeUnit === "month" ? "month" : "year"} />
                    <YAxis
                      width={80}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      name="受注金額"
                      animationDuration={1000}
                      animationBegin={0}
                      isAnimationActive={!isLoading}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* カテゴリー別売上構成 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                カテゴリー別売上構成
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ value }) => value.toLocaleString()}
                    >
                      {categorySales.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 業種別得意先数 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                業種別得意先数
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={businessTypeCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="得意先数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 在庫数の少ない商品TOP5 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                在庫数の少ない商品TOP5
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lowStockProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#82ca9d" name="在庫数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`
            fixed right-0 top-16 h-[calc(100%-64px)] bg-white border-l shadow-lg
            transition-all duration-300 z-50
            ${isGuideOpen ? "w-[450px]" : "w-[40px]"}
          `}
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  ダッシュボードの説明
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  このダッシュボードでは、以下の4つの主要な指標を確認できます：
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>
                    月別受注金額推移：時系列での受注金額の変化を確認できます
                  </li>
                  <li>
                    カテゴリー別売上構成：商品カテゴリーごとの売上比率を確認できます
                  </li>
                  <li>業種別得意先数：得意先の業種別の内訳を確認できます</li>
                  <li>
                    在庫数の少ない商品TOP5：在庫が少ない商品を確認できます
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  データは「データ更新」ボタンをクリックすることで最新の情報に更新できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

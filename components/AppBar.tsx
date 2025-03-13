"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resetDatabase } from "@/infrastructure/db";
import { generateDummyData } from "@/infrastructure/db";

export default function AppBar() {
  const handleResetDB = async () => {
    await resetDatabase();
    await generateDummyData();
    window.location.reload();
  };

  const handleClearDB = async () => {
    await resetDatabase();
    window.location.reload();
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 h-14 items-center">
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/">ホーム</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/client">得意先マスタ</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/product">商品マスタ</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/order">受注登録</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/order-list">受注一覧</Link>
          </Button>
          <div className="" />
          <Button
            variant="destructive"
            onClick={handleResetDB}
            className="bg-red-600 hover:bg-red-700"
          >
            DBダミーデータ作成
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearDB}
            className="bg-red-600 hover:bg-red-700"
          >
            DBを空にする
          </Button>
        </div>
      </div>
    </nav>
  );
}

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
            <Link href="/client">得意先</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/product">商品</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Link href="/order">受注</Link>
          </Button>
          <div className="flex-1" />
          <Button
            variant="destructive"
            onClick={handleResetDB}
            className="bg-red-600 hover:bg-red-700"
          >
            DBリセット
          </Button>
        </div>
      </div>
    </nav>
  );
}

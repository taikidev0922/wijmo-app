"use client";
import Link from "next/link";
import { Home, Users, Package, FileText, List } from "lucide-react";

export default function AppBar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800"
      style={{ zIndex: 100 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex gap-1 h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">ホーム</span>
            </Link>
            <Link
              href="/client"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>得意先マスタ</span>
            </Link>
            <Link
              href="/product"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Package className="h-5 w-5" />
              <span>商品マスタ</span>
            </Link>
            <Link
              href="/order"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>受注登録</span>
            </Link>
            <Link
              href="/order-list"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <List className="h-5 w-5" />
              <span>受注一覧</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

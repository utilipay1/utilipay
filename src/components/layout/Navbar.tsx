'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">
              UtiliPay
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* User profile / Settings could go here */}
        </div>
      </div>
    </nav>
  );
}


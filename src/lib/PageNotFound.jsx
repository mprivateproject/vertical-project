import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center space-y-4">
        <h1 className="font-display text-6xl font-semibold text-primary/20">404</h1>
        <p className="text-muted-foreground text-sm">ไม่พบหน้าที่ต้องการ</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
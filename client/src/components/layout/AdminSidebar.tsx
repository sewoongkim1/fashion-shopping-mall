import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: '대시보드', path: '/admin/dashboard' },
  { label: '회원관리', path: '/admin/users' },
  { label: '상품관리', path: '/admin/products' },
  { label: '주문관리', path: '/admin/orders' },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside className="h-full w-60 shrink-0 border-r bg-muted/40">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/admin/dashboard" className="text-lg font-bold" onClick={onNavigate}>
          Admin
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === item.path
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

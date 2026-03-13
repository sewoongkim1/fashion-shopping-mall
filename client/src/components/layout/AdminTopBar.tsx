import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/useAuth';

interface AdminTopBarProps {
  onToggleSidebar?: () => void;
}

export default function AdminTopBar({ onToggleSidebar }: AdminTopBarProps) {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* 모바일 사이드바 토글 */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border lg:hidden"
          onClick={onToggleSidebar}
          aria-label="사이드바 토글"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Shop으로 이동
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
          로그아웃
        </Button>
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/useAuth';

export default function AdminTopBar() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        Shop으로 이동
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.name}</span>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
          로그아웃
        </Button>
      </div>
    </header>
  );
}

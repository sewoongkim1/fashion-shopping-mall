import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const cartItemCount = useCartStore((s) => s.totalItems());

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">
          Fashion Mall
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
            상품
          </Link>
          <Link to="/cart" className="relative text-sm text-muted-foreground hover:text-foreground">
            장바구니
            {cartItemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">로그인</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">회원가입</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

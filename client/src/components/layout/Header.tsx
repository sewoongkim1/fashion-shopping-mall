import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { authApi } from '@/api/auth.api';

export default function Header() {
  const { user, isAuthenticated, logout: clearAuth } = useAuthStore();
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const clearCart = useCartStore((s) => s.clearCart);

  const logout = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      clearCart();
      queryClient.clear();
      navigate('/login');
    },
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold" onClick={closeMenu}>
          Fashion Mall
        </Link>

        {/* 햄버거 버튼 (모바일) */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-4 md:flex">
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
              <Link to="/my-orders" className="text-sm text-muted-foreground hover:text-foreground">
                주문내역
              </Link>
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

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <nav className="border-t px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <Link
              to="/products"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={closeMenu}
            >
              상품
            </Link>
            <Link
              to="/cart"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={closeMenu}
            >
              장바구니 {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/my-orders"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={closeMenu}
                >
                  주문내역
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-semibold text-primary"
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout.mutate();
                      closeMenu();
                    }}
                  >
                    로그아웃
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 border-t pt-3">
                <Link to="/login" className="flex-1" onClick={closeMenu}>
                  <Button variant="outline" size="sm" className="w-full">로그인</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={closeMenu}>
                  <Button size="sm" className="w-full">회원가입</Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

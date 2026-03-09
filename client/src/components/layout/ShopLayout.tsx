import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import Header from './Header';
import Footer from './Footer';

export default function ShopLayout() {
  const setUser = useAuthStore((s) => s.setUser);

  // 세션 복원: 페이지 새로고침 시 로그인 상태 확인
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authApi.getMe();
      const user = res.data.data!;
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분간 재요청 방지
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

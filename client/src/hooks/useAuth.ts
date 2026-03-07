import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi, type RegisterRequest, type LoginRequest } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

const AUTH_PAGES = ['/login', '/register'];

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, logout: clearAuth } = useAuthStore();

  const isAuthPage = AUTH_PAGES.includes(location.pathname);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authApi.getMe();
      const user = res.data.data!;
      setUser(user);
      return user;
    },
    retry: false,
    enabled: !isAuthPage,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      const user = res.data.data!;
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (res) => {
      setUser(res.data.data!);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}

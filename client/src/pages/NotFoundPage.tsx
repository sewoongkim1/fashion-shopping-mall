import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>페이지를 찾을 수 없습니다 - Fashion Mall</title>
      </Helmet>

      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-6xl font-bold text-muted-foreground">404</p>
        <h1 className="mt-4 text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/">
            <Button variant="outline">홈으로</Button>
          </Link>
          <Link to="/products">
            <Button>상품 보러가기</Button>
          </Link>
        </div>
      </div>
    </>
  );
}

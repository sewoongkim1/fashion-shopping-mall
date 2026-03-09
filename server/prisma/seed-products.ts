import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: '클래식 코튼 티셔츠',
    description: '부드러운 코튼 소재의 기본 라운드넥 티셔츠입니다.\n데일리로 편하게 착용하기 좋은 아이템입니다.',
    price: 29000, salePrice: 19900, category: 'TOP' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', sortOrder: 0 }],
    options: [
      { color: '화이트', size: 'S', stock: 15 }, { color: '화이트', size: 'M', stock: 20 }, { color: '화이트', size: 'L', stock: 10 },
      { color: '블랙', size: 'S', stock: 12 }, { color: '블랙', size: 'M', stock: 18 }, { color: '블랙', size: 'L', stock: 8 },
    ],
  },
  {
    name: '오버핏 스트라이프 셔츠',
    description: '트렌디한 오버핏 실루엣의 스트라이프 셔츠입니다.\n캐주얼부터 세미 포멀까지 다양하게 연출 가능합니다.',
    price: 45000, category: 'TOP' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', sortOrder: 0 }],
    options: [
      { color: '블루', size: 'M', stock: 10 }, { color: '블루', size: 'L', stock: 15 }, { color: '블루', size: 'XL', stock: 8 },
    ],
  },
  {
    name: '와이드 카고 팬츠',
    description: '유틸리티 무드의 와이드핏 카고 팬츠입니다.\n넉넉한 포켓 디테일이 포인트입니다.',
    price: 65000, category: 'BOTTOM' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', sortOrder: 0 }],
    options: [
      { color: '카키', size: 'M', stock: 12 }, { color: '카키', size: 'L', stock: 15 },
      { color: '베이지', size: 'M', stock: 10 }, { color: '베이지', size: 'L', stock: 8 },
    ],
  },
  {
    name: '울 블렌드 싱글 코트',
    description: '고급 울 블렌드 소재의 싱글 코트입니다.\n미니멀한 디자인으로 다양한 코디에 매치하기 좋습니다.',
    price: 189000, salePrice: 139000, category: 'OUTER' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'M', stock: 5 }, { color: '블랙', size: 'L', stock: 7 },
      { color: '차콜', size: 'M', stock: 4 }, { color: '차콜', size: 'L', stock: 6 },
    ],
  },
  {
    name: '경량 패딩 점퍼',
    description: '가볍고 따뜻한 경량 패딩 점퍼입니다.\n이너로도 아우터로도 활용 가능한 만능 아이템입니다.',
    price: 89000, category: 'OUTER' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1544923246-77307dd270b3?w=600', sortOrder: 0 }],
    options: [
      { color: '네이비', size: 'M', stock: 20 }, { color: '네이비', size: 'L', stock: 15 },
      { color: '블랙', size: 'M', stock: 18 }, { color: '블랙', size: 'L', stock: 12 },
    ],
  },
  {
    name: '플로럴 미디 원피스',
    description: '화사한 플로럴 패턴의 미디 기장 원피스입니다.\n여성스러운 실루엣이 돋보이는 아이템입니다.',
    price: 78000, salePrice: 55000, category: 'DRESS' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', sortOrder: 0 }],
    options: [
      { color: '아이보리', size: 'S', stock: 8 }, { color: '아이보리', size: 'M', stock: 12 },
      { color: '핑크', size: 'S', stock: 6 }, { color: '핑크', size: 'M', stock: 10 },
    ],
  },
  {
    name: '레더 크로스백',
    description: '고급 인조 레더 소재의 미니 크로스백입니다.\n심플한 디자인으로 어떤 룩에도 잘 어울립니다.',
    price: 49000, category: 'BAG' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'FREE', stock: 25 }, { color: '브라운', size: 'FREE', stock: 20 }, { color: '크림', size: 'FREE', stock: 15 },
    ],
  },
  {
    name: '캔버스 스니커즈',
    description: '클래식한 캔버스 소재의 로우탑 스니커즈입니다.\n가볍고 편한 착화감이 특징입니다.',
    price: 55000, salePrice: 35000, category: 'SHOES' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600', sortOrder: 0 }],
    options: [
      { color: '화이트', size: '250', stock: 10 }, { color: '화이트', size: '260', stock: 12 }, { color: '화이트', size: '270', stock: 8 },
      { color: '블랙', size: '250', stock: 10 }, { color: '블랙', size: '260', stock: 15 }, { color: '블랙', size: '270', stock: 6 },
    ],
  },
  {
    name: '실버 체인 목걸이',
    description: '심플한 실버 체인 목걸이입니다.\n레이어드하여 착용하면 더욱 스타일리시합니다.',
    price: 32000, category: 'ACCESSORY' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=600', sortOrder: 0 }],
    options: [{ color: '실버', size: 'FREE', stock: 30 }],
  },
  {
    name: '니트 비니',
    description: '부드러운 니트 소재의 비니입니다.\n겨울 필수 아이템으로 보온성이 뛰어납니다.',
    price: 25000, salePrice: 18000, category: 'ACCESSORY' as const, status: 'ACTIVE' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'FREE', stock: 20 }, { color: '그레이', size: 'FREE', stock: 15 }, { color: '베이지', size: 'FREE', stock: 12 },
    ],
  },
];

async function main() {
  for (const p of products) {
    const { images, options, ...productData } = p;
    const existing = await prisma.product.findFirst({ where: { name: p.name, isDeleted: false } });
    if (existing) {
      console.log(`  스킵: ${p.name} (이미 존재)`);
      continue;
    }
    await prisma.product.create({
      data: {
        ...productData,
        images: { create: images },
        options: { create: options },
      },
    });
    console.log(`  등록: ${p.name}`);
  }

  const count = await prisma.product.count({ where: { isDeleted: false } });
  console.log(`\n총 상품 수: ${count}개`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

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
  // TOP (4개)
  {
    name: '린넨 반팔 셔츠',
    description: '시원한 린넨 소재의 반팔 셔츠입니다.\n여름철 데일리룩으로 추천합니다.',
    price: 42000, salePrice: 29900, category: 'TOP' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', sortOrder: 0 }],
    options: [
      { color: '화이트', size: 'M', stock: 15 }, { color: '화이트', size: 'L', stock: 12 },
      { color: '베이지', size: 'M', stock: 10 }, { color: '베이지', size: 'L', stock: 8 },
    ],
  },
  {
    name: '크루넥 맨투맨',
    description: '두툼한 기모 안감의 크루넥 맨투맨입니다.\n편안한 데일리 아이템입니다.',
    price: 38000, category: 'TOP' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', sortOrder: 0 }],
    options: [
      { color: '그레이', size: 'M', stock: 20 }, { color: '그레이', size: 'L', stock: 18 },
      { color: '블랙', size: 'M', stock: 15 }, { color: '블랙', size: 'L', stock: 12 },
      { color: '네이비', size: 'M', stock: 10 }, { color: '네이비', size: 'L', stock: 8 },
    ],
  },
  {
    name: '후드 집업',
    description: '가벼운 후드 집업 자켓입니다.\n환절기에 가볍게 걸치기 좋습니다.',
    price: 52000, salePrice: 39000, category: 'TOP' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'M', stock: 14 }, { color: '블랙', size: 'L', stock: 10 },
      { color: '차콜', size: 'M', stock: 12 }, { color: '차콜', size: 'L', stock: 9 },
    ],
  },
  {
    name: '헨리넥 긴팔 티',
    description: '깔끔한 헨리넥 디자인의 긴팔 티셔츠입니다.\n단독 착용이나 이너로 활용 가능합니다.',
    price: 32000, category: 'TOP' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', sortOrder: 0 }],
    options: [
      { color: '화이트', size: 'S', stock: 10 }, { color: '화이트', size: 'M', stock: 15 }, { color: '화이트', size: 'L', stock: 12 },
      { color: '블랙', size: 'S', stock: 8 }, { color: '블랙', size: 'M', stock: 14 }, { color: '블랙', size: 'L', stock: 10 },
    ],
  },
  // BOTTOM (4개)
  {
    name: '코튼 조거 팬츠',
    description: '편안한 코튼 소재의 조거 팬츠입니다.\n운동부터 일상까지 멀티로 착용 가능합니다.',
    price: 39000, salePrice: 27000, category: 'BOTTOM' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'M', stock: 20 }, { color: '블랙', size: 'L', stock: 15 },
      { color: '그레이', size: 'M', stock: 18 }, { color: '그레이', size: 'L', stock: 12 },
    ],
  },
  {
    name: '코듀로이 팬츠',
    description: '빈티지한 무드의 코듀로이 팬츠입니다.\n가을/겨울 시즌에 잘 어울리는 아이템입니다.',
    price: 58000, category: 'BOTTOM' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', sortOrder: 0 }],
    options: [
      { color: '브라운', size: '30', stock: 10 }, { color: '브라운', size: '32', stock: 12 },
      { color: '베이지', size: '30', stock: 8 }, { color: '베이지', size: '32', stock: 10 },
    ],
  },
  {
    name: '플리츠 미디 스커트',
    description: '은은한 광택의 플리츠 미디 스커트입니다.\n우아하고 여성스러운 실루엣이 돋보입니다.',
    price: 45000, salePrice: 32000, category: 'BOTTOM' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'S', stock: 10 }, { color: '블랙', size: 'M', stock: 14 },
      { color: '네이비', size: 'S', stock: 8 }, { color: '네이비', size: 'M', stock: 12 },
    ],
  },
  {
    name: '치노 팬츠',
    description: '깔끔한 핏의 치노 팬츠입니다.\n비즈니스 캐주얼에도 잘 어울립니다.',
    price: 49000, category: 'BOTTOM' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?w=600', sortOrder: 0 }],
    options: [
      { color: '카키', size: '30', stock: 15 }, { color: '카키', size: '32', stock: 12 },
      { color: '네이비', size: '30', stock: 10 }, { color: '네이비', size: '32', stock: 8 },
    ],
  },
  // OUTER (3개)
  {
    name: '데님 자켓',
    description: '클래식한 데님 자켓입니다.\n어떤 스타일에도 잘 어울리는 기본 아우터입니다.',
    price: 79000, salePrice: 59000, category: 'OUTER' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600', sortOrder: 0 }],
    options: [
      { color: '인디고', size: 'M', stock: 10 }, { color: '인디고', size: 'L', stock: 8 },
      { color: '라이트블루', size: 'M', stock: 7 }, { color: '라이트블루', size: 'L', stock: 6 },
    ],
  },
  {
    name: '트렌치 코트',
    description: '클래식 핏 트렌치 코트입니다.\n봄가을 시즌 필수 아우터입니다.',
    price: 159000, category: 'OUTER' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', sortOrder: 0 }],
    options: [
      { color: '베이지', size: 'M', stock: 6 }, { color: '베이지', size: 'L', stock: 5 },
      { color: '블랙', size: 'M', stock: 4 }, { color: '블랙', size: 'L', stock: 4 },
    ],
  },
  {
    name: '플리스 자켓',
    description: '보송보송한 플리스 소재의 집업 자켓입니다.\n겨울 이너로 착용하기 좋습니다.',
    price: 65000, salePrice: 45000, category: 'OUTER' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1614251056798-0a63eda2bb25?w=600', sortOrder: 0 }],
    options: [
      { color: '아이보리', size: 'M', stock: 12 }, { color: '아이보리', size: 'L', stock: 10 },
      { color: '브라운', size: 'M', stock: 8 }, { color: '브라운', size: 'L', stock: 7 },
    ],
  },
  // DRESS (2개)
  {
    name: '니트 원피스',
    description: '부드러운 니트 소재의 원피스입니다.\n단독 착용 또는 레이어드로 다양하게 연출 가능합니다.',
    price: 68000, category: 'DRESS' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'S', stock: 8 }, { color: '블랙', size: 'M', stock: 12 },
      { color: '그레이', size: 'S', stock: 6 }, { color: '그레이', size: 'M', stock: 10 },
    ],
  },
  {
    name: '셔츠 원피스',
    description: '깔끔한 셔츠 디테일의 원피스입니다.\n벨트를 매면 더욱 세련된 실루엣을 연출할 수 있습니다.',
    price: 72000, salePrice: 52000, category: 'DRESS' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600', sortOrder: 0 }],
    options: [
      { color: '화이트', size: 'S', stock: 7 }, { color: '화이트', size: 'M', stock: 10 },
      { color: '스카이블루', size: 'S', stock: 5 }, { color: '스카이블루', size: 'M', stock: 8 },
    ],
  },
  // SHOES (3개)
  {
    name: '레더 첼시 부츠',
    description: '클래식한 레더 첼시 부츠입니다.\n사계절 착용 가능한 기본 부츠입니다.',
    price: 98000, salePrice: 75000, category: 'SHOES' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: '250', stock: 8 }, { color: '블랙', size: '260', stock: 10 }, { color: '블랙', size: '270', stock: 7 },
      { color: '브라운', size: '250', stock: 6 }, { color: '브라운', size: '260', stock: 8 }, { color: '브라운', size: '270', stock: 5 },
    ],
  },
  {
    name: '러닝 스니커즈',
    description: '쿠션감이 뛰어난 러닝 스니커즈입니다.\n가볍고 통기성이 좋아 운동에 적합합니다.',
    price: 89000, category: 'SHOES' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', sortOrder: 0 }],
    options: [
      { color: '화이트', size: '250', stock: 12 }, { color: '화이트', size: '260', stock: 15 }, { color: '화이트', size: '270', stock: 10 },
      { color: '블랙', size: '250', stock: 10 }, { color: '블랙', size: '260', stock: 12 }, { color: '블랙', size: '270', stock: 8 },
    ],
  },
  {
    name: '스웨이드 로퍼',
    description: '고급스러운 스웨이드 소재의 로퍼입니다.\n비즈니스 캐주얼에 잘 어울립니다.',
    price: 78000, salePrice: 59000, category: 'SHOES' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600', sortOrder: 0 }],
    options: [
      { color: '브라운', size: '250', stock: 8 }, { color: '브라운', size: '260', stock: 10 }, { color: '브라운', size: '270', stock: 6 },
      { color: '블랙', size: '250', stock: 7 }, { color: '블랙', size: '260', stock: 9 }, { color: '블랙', size: '270', stock: 5 },
    ],
  },
  // BAG (2개)
  {
    name: '캔버스 토트백',
    description: '넉넉한 사이즈의 캔버스 토트백입니다.\n수업, 출근 등 다양한 상황에 활용 가능합니다.',
    price: 35000, category: 'BAG' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600', sortOrder: 0 }],
    options: [
      { color: '아이보리', size: 'FREE', stock: 30 }, { color: '블랙', size: 'FREE', stock: 25 },
    ],
  },
  {
    name: '미니 버킷백',
    description: '트렌디한 미니 버킷백입니다.\n크로스바디로 착용 가능하며 데일리로 추천합니다.',
    price: 56000, salePrice: 42000, category: 'BAG' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'FREE', stock: 15 }, { color: '브라운', size: 'FREE', stock: 12 }, { color: '크림', size: 'FREE', stock: 10 },
    ],
  },
  // ACCESSORY (2개)
  {
    name: '가죽 벨트',
    description: '심플한 디자인의 소가죽 벨트입니다.\n캐주얼과 포멀 모두 사용 가능합니다.',
    price: 38000, category: 'ACCESSORY' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', sortOrder: 0 }],
    options: [
      { color: '블랙', size: 'FREE', stock: 20 }, { color: '브라운', size: 'FREE', stock: 18 },
    ],
  },
  {
    name: '울 머플러',
    description: '따뜻한 울 소재의 머플러입니다.\n겨울 필수 방한 아이템입니다.',
    price: 45000, salePrice: 32000, category: 'ACCESSORY' as const,
    images: [{ url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600', sortOrder: 0 }],
    options: [
      { color: '그레이', size: 'FREE', stock: 15 }, { color: '베이지', size: 'FREE', stock: 12 },
      { color: '블랙', size: 'FREE', stock: 18 }, { color: '버건디', size: 'FREE', stock: 10 },
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
        status: 'ACTIVE',
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

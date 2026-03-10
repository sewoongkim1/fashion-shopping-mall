import axios from 'axios';
import prisma from '../lib/prisma';

const IAMPORT_API_URL = 'https://api.iamport.kr';

class PaymentService {
  /** 포트원 액세스 토큰 발급 */
  private async getAccessToken(): Promise<string> {
    const res = await axios.post(`${IAMPORT_API_URL}/users/getToken`, {
      imp_key: process.env.IAMPORT_API_KEY,
      imp_secret: process.env.IAMPORT_API_SECRET,
    });

    if (res.data.code !== 0) {
      throw new Error('포트원 인증에 실패했습니다.');
    }

    return res.data.response.access_token;
  }

  /** 포트원 결제 정보 조회 */
  private async getPaymentData(impUid: string, accessToken: string) {
    const res = await axios.get(`${IAMPORT_API_URL}/payments/${impUid}`, {
      headers: { Authorization: accessToken },
    });

    if (res.data.code !== 0) {
      throw new Error('결제 정보를 조회할 수 없습니다.');
    }

    return res.data.response;
  }

  /** 결제 검증 및 Payment 레코드 생성 */
  async verifyAndSave(impUid: string, merchantUid: string, orderId: string, userId: string) {
    // 1. 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new Error('해당 주문에 대한 권한이 없습니다.');
    }

    if (order.payment) {
      throw new Error('이미 결제가 완료된 주문입니다.');
    }

    // 2. 포트원 결제 정보 조회
    const accessToken = await this.getAccessToken();
    const paymentData = await this.getPaymentData(impUid, accessToken);

    // 3. 결제 금액 검증
    const expectedAmount = order.totalAmount + order.shippingFee;

    if (paymentData.amount !== expectedAmount) {
      // 금액 불일치 - 위변조 의심, 결제 취소 처리
      await axios.post(
        `${IAMPORT_API_URL}/payments/cancel`,
        { imp_uid: impUid, reason: '결제 금액 불일치' },
        { headers: { Authorization: accessToken } },
      );

      throw new Error(
        `결제 금액이 일치하지 않습니다. (예상: ${expectedAmount}, 실제: ${paymentData.amount})`,
      );
    }

    // 4. 결제 상태 확인
    if (paymentData.status !== 'paid') {
      // 결제 실패 처리
      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentKey: impUid,
          method: paymentData.pay_method || 'unknown',
          amount: paymentData.amount,
          status: 'FAILED',
        },
      });

      throw new Error(`결제가 완료되지 않았습니다. (상태: ${paymentData.status})`);
    }

    // 5. 트랜잭션으로 Payment 생성 + Order 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          paymentKey: impUid,
          method: paymentData.pay_method || 'card',
          amount: paymentData.amount,
          status: 'APPROVED',
          approvedAt: paymentData.paid_at ? new Date(paymentData.paid_at * 1000) : new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
        include: { items: true, payment: true },
      });

      return updatedOrder;
    });

    return result;
  }
}

export const paymentService = new PaymentService();

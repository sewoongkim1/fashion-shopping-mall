interface IamportRequestPayParams {
  pg?: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  buyer_tel?: string;
  buyer_addr?: string;
  buyer_postcode?: string;
  m_redirect_url?: string;
}

interface IamportResponse {
  success: boolean;
  imp_uid: string | null;
  merchant_uid: string;
  error_msg: string | null;
  error_code: string | null;
  paid_amount?: number;
  apply_num?: string;
  pg_type?: string;
  pay_method?: string;
}

interface IMP {
  init: (merchantId: string) => void;
  request_pay: (
    params: IamportRequestPayParams,
    callback: (response: IamportResponse) => void,
  ) => void;
}

interface Window {
  IMP?: IMP;
}

/**
 * VietQR / Vietnam Bank types
 * Ported from khoantd/viet-erp @vierp/vietnam package
 */

export enum BankCode {
  VCB = 'VCB',   // Vietcombank
  BIDV = 'BIDV',
  TCB = 'TCB',   // Techcombank
  MB = 'MB',
  VPB = 'VPB',   // VPBank
  ACB = 'ACB',
  SHB = 'SHB',
  TPB = 'TPB',   // TPBank
  HDB = 'HDB',   // HDBank
  STB = 'STB',   // Sacombank
  EXB = 'EXB',   // Exim Bank
  MBB = 'MBB',
  VIB = 'VIB',
  CTG = 'CTG',   // SeABank
  OCB = 'OCB',
  VRB = 'VRB',
  NAB = 'NAB',   // Nam Á Bank
  BVB = 'BVB',
  PGB = 'PGB',
  BAB = 'BAB',   // Bắc Á Bank
}

export interface BankInfo {
  code: BankCode;
  name: string;
  englishName: string;
  swiftCode: string;
  bin: string;
}

export interface VietQRCode {
  bankCode: BankCode;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  qrString: string;
  expiryDate?: Date;
}

export interface VietQRParsed {
  bankCode: BankCode | string;
  accountNumber: string;
  amount?: number;
  valid: boolean;
}

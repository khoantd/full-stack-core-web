export enum BankCode {
  VCB = 'VCB', BIDV = 'BIDV', TCB = 'TCB', MB = 'MB', VPB = 'VPB',
  ACB = 'ACB', SHB = 'SHB', TPB = 'TPB', HDB = 'HDB', STB = 'STB',
  EXB = 'EXB', MBB = 'MBB', VIB = 'VIB', CTG = 'CTG', OCB = 'OCB',
  VRB = 'VRB', NAB = 'NAB', BVB = 'BVB', PGB = 'PGB', BAB = 'BAB',
}

export interface BankInfo {
  code: BankCode;
  name: string;
  englishName: string;
  swiftCode: string;
  bin: string;
}

export interface TenantBankAccount {
  _id: string;
  tenantId: string;
  bankCode: BankCode;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBankAccountRequest {
  bankCode: BankCode;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
}

export interface VietQRGenerateRequest {
  bankCode: BankCode;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
}

export interface VietQRResult {
  bankCode: BankCode;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  qrString: string;
  expiryDate?: string;
}

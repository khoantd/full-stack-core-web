/**
 * VietQR Service
 * Ported from khoantd/viet-erp — NAPAS EMVCo QR standard
 */
import { Injectable } from '@nestjs/common';
import { BankCode, BankInfo, VietQRCode, VietQRParsed } from './vietqr.types';

const BANKS: Record<BankCode, BankInfo> = {
  VCB:  { code: BankCode.VCB,  name: 'Ngân hàng Ngoại thương Việt Nam', englishName: 'Vietcombank',                          swiftCode: 'BFTVVNVX', bin: '970436' },
  BIDV: { code: BankCode.BIDV, name: 'Ngân hàng Đầu tư và Phát triển',  englishName: 'BIDV',                                 swiftCode: 'BIDVVNVX', bin: '970418' },
  TCB:  { code: BankCode.TCB,  name: 'Ngân hàng Kỹ thương Việt Nam',    englishName: 'Techcombank',                          swiftCode: 'TECHVNVX', bin: '970407' },
  MB:   { code: BankCode.MB,   name: 'Ngân hàng Quân đội',              englishName: 'MB Bank',                              swiftCode: 'MSCBVNVX', bin: '970422' },
  VPB:  { code: BankCode.VPB,  name: 'Ngân hàng VPBank',                englishName: 'VPBank',                               swiftCode: 'VPBKVNVX', bin: '970432' },
  ACB:  { code: BankCode.ACB,  name: 'Ngân hàng Á Châu',                englishName: 'Asia Commercial Bank',                 swiftCode: 'ASCBVNVX', bin: '970425' },
  SHB:  { code: BankCode.SHB,  name: 'Ngân hàng SHB',                   englishName: 'SHB',                                  swiftCode: 'SHBKVNVX', bin: '970443' },
  TPB:  { code: BankCode.TPB,  name: 'Ngân hàng TPBank',                englishName: 'TPBank',                               swiftCode: 'TPBKVNVX', bin: '970423' },
  HDB:  { code: BankCode.HDB,  name: 'Ngân hàng HDBank',                englishName: 'HDBank',                               swiftCode: 'HDBKVNVX', bin: '970437' },
  STB:  { code: BankCode.STB,  name: 'Ngân hàng Sacombank',             englishName: 'Sacombank',                            swiftCode: 'SACOMVN',  bin: '970424' },
  EXB:  { code: BankCode.EXB,  name: 'Ngân hàng Xuất nhập khẩu',       englishName: 'Exim Bank',                            swiftCode: 'EXIMBVN',  bin: '970419' },
  MBB:  { code: BankCode.MBB,  name: 'Ngân hàng Quân đội (MBB)',        englishName: 'Military Commercial Bank',             swiftCode: 'MCBKVNVX', bin: '970426' },
  VIB:  { code: BankCode.VIB,  name: 'Ngân hàng VIB',                   englishName: 'Vietnam International Bank',           swiftCode: 'VIBKVNVX', bin: '970441' },
  CTG:  { code: BankCode.CTG,  name: 'Ngân hàng SeABank',               englishName: 'Southeast Asia Bank',                  swiftCode: 'CTGDVNVX', bin: '970412' },
  OCB:  { code: BankCode.OCB,  name: 'Ngân hàng Phương Đông',           englishName: 'Orient Commercial Bank',               swiftCode: 'ORCBVNVX', bin: '970448' },
  VRB:  { code: BankCode.VRB,  name: 'Ngân hàng VRB',                   englishName: 'Vietnam Rubber Bank',                  swiftCode: 'VRBBVNVX', bin: '970456' },
  NAB:  { code: BankCode.NAB,  name: 'Ngân hàng Nam Á',                 englishName: 'Nam A Bank',                           swiftCode: 'NAMAVNVX', bin: '970452' },
  BVB:  { code: BankCode.BVB,  name: 'Ngân hàng BVBANK',                englishName: 'BVBANK',                               swiftCode: 'BVBKVNVX', bin: '970450' },
  PGB:  { code: BankCode.PGB,  name: 'Ngân hàng PGB',                   englishName: 'PGB',                                  swiftCode: 'PGBKVNVX', bin: '970445' },
  BAB:  { code: BankCode.BAB,  name: 'Ngân hàng Bắc Á',                 englishName: 'Bac A Bank',                           swiftCode: 'BABKVNVX', bin: '970454' },
};

const BIN_MAP: Record<string, BankCode> = Object.fromEntries(
  Object.values(BANKS).map((b) => [b.bin, b.code]),
);

@Injectable()
export class VietQRService {
  getAllBanks(): BankInfo[] {
    return Object.values(BANKS);
  }

  getBankByCode(code: BankCode): BankInfo | null {
    return BANKS[code] ?? null;
  }

  getBankByBIN(bin: string): BankInfo | null {
    const code = BIN_MAP[bin];
    return code ? BANKS[code] : null;
  }

  /**
   * Generate VietQR string (NAPAS / EMVCo format)
   * Format: 00020126 + 360005 + BIN(6) + account(20) + amount(13) + desc
   */
  generateQRString(
    bankCode: BankCode,
    accountNumber: string,
    amount?: number,
    description?: string,
  ): string {
    const bank = this.getBankByCode(bankCode);
    if (!bank) throw new Error(`Unknown bank code: ${bankCode}`);

    const paddedAccount = accountNumber.padStart(20, '0');
    const paddedAmount = amount != null ? String(Math.round(amount)).padStart(13, '0') : '0000000000000';
    const encodedDesc = description ? encodeURIComponent(description) : '';

    return `00020126360005${bank.bin}${paddedAccount}${paddedAmount}${encodedDesc}`;
  }

  createVietQR(
    bankCode: BankCode,
    accountNumber: string,
    accountName?: string,
    amount?: number,
    description?: string,
  ): VietQRCode {
    const qrString = this.generateQRString(bankCode, accountNumber, amount, description);
    return {
      bankCode,
      accountNumber,
      accountName,
      amount,
      description,
      qrString,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  parseVietQR(qrString: string): VietQRParsed {
    if (!qrString || qrString.length < 50 || !qrString.startsWith('00020126')) {
      return { bankCode: '', accountNumber: '', valid: false };
    }
    try {
      const bin = qrString.substring(8, 14);
      const accountNumber = qrString.substring(14, 34).replace(/^0+/, '');
      const amountStr = qrString.substring(34, 47);
      const bankCode = BIN_MAP[bin];
      const amount = amountStr !== '0000000000000' ? parseInt(amountStr, 10) : undefined;
      return { bankCode: bankCode ?? '', accountNumber, amount, valid: !!bankCode };
    } catch {
      return { bankCode: '', accountNumber: '', valid: false };
    }
  }

  validateQRString(qrString: string): { valid: boolean; message?: string } {
    if (!qrString) return { valid: false, message: 'QR string is required' };
    if (qrString.length < 50) return { valid: false, message: 'Invalid QR string length' };
    if (!qrString.startsWith('00020126')) return { valid: false, message: 'Invalid QR version' };
    const parsed = this.parseVietQR(qrString);
    return parsed.valid ? { valid: true } : { valid: false, message: 'Invalid QR data' };
  }
}

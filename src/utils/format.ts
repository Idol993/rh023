export function formatCurrency(num: number | string | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || num === '') return '¥0.00';
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return '¥0.00';
  const formatted = value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `¥${formatted}`;
}

export function formatDate(
  str: string | Date | null | undefined,
  withTime = true
): string {
  if (!str) return '-';
  const date = typeof str === 'string' ? new Date(str) : str;
  if (isNaN(date.getTime())) return '-';

  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (!withTime) return `${year}-${month}-${day}`;

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatDateOnly(str: string | Date | null | undefined): string {
  return formatDate(str, false);
}

export function formatPercent(
  num: number | string | null | undefined,
  decimals = 1
): string {
  if (num === null || num === undefined || num === '') return '0%';
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function maskIdCard(id: string | null | undefined): string {
  if (!id) return '-';
  if (id.length < 8) return id;
  const start = id.slice(0, 6);
  const end = id.slice(-4);
  const middle = '*'.repeat(id.length - 10);
  return `${start}${middle}${end}`;
}

export function maskBankCard(card: string | null | undefined): string {
  if (!card) return '-';
  const clean = card.replace(/\s/g, '');
  if (clean.length < 8) return card;
  const start = clean.slice(0, 6);
  const end = clean.slice(-4);
  const middle = '*'.repeat(clean.length - 10);
  const result = `${start}${middle}${end}`;
  return result.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  if (phone.length < 7) return phone;
  const start = phone.slice(0, 3);
  const end = phone.slice(-4);
  const middle = '*'.repeat(phone.length - 7);
  return `${start}${middle}${end}`;
}

export function maskName(name: string | null | undefined): string {
  if (!name) return '-';
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}`;
}

interface TaxResult {
  taxableIncome: number;
  taxAmount: number;
  netAmount: number;
  bracket: string;
  rate: number;
  deduction: number;
}

export function calculateTax(amount: number): TaxResult {
  if (!amount || amount <= 0) {
    return {
      taxableIncome: 0,
      taxAmount: 0,
      netAmount: amount || 0,
      bracket: '免征',
      rate: 0,
      deduction: 0,
    };
  }

  const taxableIncome = amount * 0.8;

  let rate = 0;
  let deduction = 0;
  let bracket = '';

  if (taxableIncome <= 20000) {
    rate = 0.2;
    deduction = 0;
    bracket = '20%';
  } else if (taxableIncome <= 50000) {
    rate = 0.3;
    deduction = 2000;
    bracket = '30%';
  } else {
    rate = 0.4;
    deduction = 7000;
    bracket = '40%';
  }

  if (amount <= 4000) {
    const smallTaxable = Math.max(0, amount - 800);
    const smallTax = smallTaxable * 0.2;
    return {
      taxableIncome: smallTaxable,
      taxAmount: Math.round(smallTax * 100) / 100,
      netAmount: Math.round((amount - smallTax) * 100) / 100,
      bracket: '20%',
      rate: 0.2,
      deduction: 0,
    };
  }

  const taxAmount = taxableIncome * rate - deduction;

  return {
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netAmount: Math.round((amount - taxAmount) * 100) / 100,
    bracket,
    rate,
    deduction,
  };
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export function formatNumber(
  num: number | string | null | undefined,
  decimals = 0
): string {
  if (num === null || num === undefined || num === '') return '0';
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return '0';
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '0分钟';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分钟`;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}

export function timeAgo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '-';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (weeks < 5) return `${weeks}周前`;
  if (months < 12) return `${months}个月前`;
  return `${years}年前`;
}

export function generateOrderNo(prefix = ''): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const trimmed = name.trim();
  if (!trimmed) return 'U';
  return trimmed.charAt(0).toUpperCase();
}

export function truncateText(
  text: string | null | undefined,
  maxLength: number
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

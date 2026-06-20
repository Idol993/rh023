import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  UserCircle,
  Network,
  CheckCircle2,
  PenLine,
  Copy,
  Download,
  ShieldCheck,
  Hash,
  Clock,
  FileCheck,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { contractsApi } from '../../lib/api';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Contract } from '@shared/types';

const MOCK_CONTRACT: Contract = {
  id: 'CT202501004',
  jobId: '4',
  companyId: 'c1',
  workerId: 'w4',
  content: '',
  templateVersion: 'v2.1',
  companySigned: true,
  workerSigned: false,
  platformSigned: false,
  signedAt: undefined,
  status: 'signing',
};

const JOB_INFO = {
  title: '电子厂流水线装配工（长期）',
  type: '计件' as const,
  rate: 0.85,
  unit: '件',
  startDate: '2025-01-01',
  endDate: '2025-06-30',
  address: '上海市浦东新区康桥工业区康桥东路888号',
};

const COMPANY_INFO = {
  name: '上海智汇企业管理有限公司',
  licenseNo: '91310000MA1FL12345',
  contact: '李经理 / 13900139000',
  signName: '李建国',
  signTime: '2025-01-02 09:30:15',
};

const WORKER_INFO = {
  name: '陈静',
  idCard: '31010119950404****',
  phone: '138****8901',
  signName: '陈静',
  signTime: '2025-01-03 14:22:08',
};

const PLATFORM_INFO = {
  name: '灵活用工服务平台',
  operator: '平台管理员',
  signTime: '2025-01-03 15:00:00',
};

const BLOCKCHAIN_INFO = {
  depositNo: 'BLK2025010300888',
  hash: '0x8f3b7c1d9e2a4f6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
  timestamp: '2025-01-03 15:00:01',
};

function generateSignature(name: string) {
  const sigs: Record<string, string> = {
    '李建国': '李建国印',
    '陈静': '陈静',
    '平台管理员': '平台签章',
  };
  return sigs[name] || '电子签章';
}

interface SignAreaProps {
  role: 'company' | 'worker' | 'platform';
  title: string;
  subtitle: string;
  infoLines: string[];
  icon: React.ReactNode;
  signed: boolean;
  signName?: string;
  signTime?: string;
  onSign?: () => void;
  signing?: boolean;
  bgColor: string;
  iconBg: string;
  borderColor: string;
}

function SignArea({
  role,
  title,
  subtitle,
  infoLines,
  icon,
  signed,
  signName,
  signTime,
  onSign,
  signing,
  bgColor,
  iconBg,
  borderColor,
}: SignAreaProps) {
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    if (signed) {
      setShowAnim(true);
    }
  }, [signed]);

  return (
    <div
      className={clsx(
        'rounded-xl border-2 p-4 transition-all relative overflow-hidden',
        signed ? borderColor : 'border-dashed border-gray-200 bg-gray-50/30',
        showAnim && 'animate-sign-highlight'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={clsx('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', iconBg)}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              {title}
              {signed && (
                <Badge variant="success" dot>
                  已签署
                </Badge>
              )}
              {!signed && (
                <Badge variant="warning" dot>
                  待签署
                </Badge>
              )}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {signed && (
          <div className="text-emerald-500 animate-bounce-slow">
            <CheckCircle2 size={22} className="drop-shadow-sm" />
          </div>
        )}
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-4">
        {infoLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {signed ? (
        <div className={clsx('rounded-lg p-3', bgColor)}>
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 mb-1">电子签名</p>
              <div
                className={clsx(
                  'inline-flex items-center px-2.5 py-1 rounded font-bold text-base border-2',
                  role === 'company'
                    ? 'border-blue-500 text-blue-700 italic'
                    : role === 'worker'
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-purple-500 text-purple-700 italic'
                )}
                style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
              >
                {generateSignature(signName || '')}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-500 mb-1">签署时间</p>
              <p className="text-xs font-mono text-gray-700 whitespace-nowrap">{signTime}</p>
            </div>
          </div>
        </div>
      ) : (
        <Button
          fullWidth
          onClick={onSign}
          loading={signing}
          leftIcon={<PenLine size={14} />}
          variant={role === 'worker' ? 'primary' : 'secondary'}
        >
          {signing ? '签署中...' : `确认签署${role === 'worker' ? '（我）' : ''}`}
        </Button>
      )}
    </div>
  );
}

export default function ContractSign() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<Contract>(MOCK_CONTRACT);
  const [signingRole, setSigningRole] = useState<'company' | 'worker' | 'platform' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const allSigned = contract.companySigned && contract.workerSigned && contract.platformSigned;

  const handleSign = async (role: 'company' | 'worker' | 'platform') => {
    setSigningRole(role);
    await new Promise((r) => setTimeout(r, 1500));

    setContract((prev) => {
      const next = { ...prev };
      if (role === 'company') next.companySigned = true;
      if (role === 'worker') next.workerSigned = true;
      if (role === 'platform') next.platformSigned = true;
      if (next.companySigned && next.workerSigned && next.platformSigned) {
        next.status = 'deposited';
        next.blockchainHash = BLOCKCHAIN_INFO.hash;
        next.depositNo = BLOCKCHAIN_INFO.depositNo;
      }
      return next;
    });

    setSigningRole(null);

    if (role === 'platform') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    }
  };

  const copyHash = () => {
    navigator.clipboard?.writeText(BLOCKCHAIN_INFO.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const signedCount = [contract.companySigned, contract.workerSigned, contract.platformSigned].filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-success-slide">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px]">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
              <div className="relative bg-white text-emerald-500 rounded-full p-1.5">
                <Check size={20} strokeWidth={3} />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base">三方签署完成！</p>
              <p className="text-emerald-100 text-sm mt-0.5">协议已上链存证，永久不可篡改</p>
            </div>
            <Sparkles size={24} className="text-amber-300 animate-spin-slow" />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contracts')}
            leftIcon={<ArrowLeft size={16} />}
          >
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              协议签署
              <Badge variant={allSigned ? 'success' : 'warning'}>
                {allSigned ? '已完成' : `签署中 ${signedCount}/3`}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              协议编号：<span className="font-mono">{contract.id}</span>
              <span className="mx-2">·</span>
              模板版本：{contract.templateVersion}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download size={14} />}
            disabled={!allSigned}
          >
            下载PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-gray-200 rounded-2xl" />
            <div className="absolute inset-0 translate-x-1 translate-y-1 bg-gray-100 rounded-2xl" />
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-10 py-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-3">
                      <FileCheck size={12} />
                      灵活用工服务协议
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide">电子用工服务协议书</h2>
                    <p className="text-blue-100 text-sm mt-1.5">
                      Electronic Flexible Labor Service Agreement
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2 text-right">
                    <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-[10px] text-blue-100">协议编号</p>
                      <p className="font-mono font-semibold text-sm">{contract.id}</p>
                    </div>
                    <p className="text-xs text-blue-100">签订地点：上海市</p>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 max-w-none" style={{ fontFamily: '"Noto Serif SC", "SimSun", serif' }}>
                <div className="text-center text-sm text-gray-600 mb-8 pb-6 border-b border-dashed border-gray-200">
                  本协议由以下三方于 <span className="font-semibold text-gray-900">{JOB_INFO.startDate}</span> 自愿签订，三方均已阅读并理解本协议全部条款
                </div>

                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      一
                    </span>
                    服务内容
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <div className="grid grid-cols-3 gap-4 pb-3 border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">用工项目</p>
                        <p className="font-semibold text-gray-900">{JOB_INFO.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">结算方式</p>
                        <p className="font-semibold text-gray-900">按{JOB_INFO.type}结算</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">计酬标准</p>
                        <p className="font-semibold text-emerald-600">{formatCurrency(JOB_INFO.rate)}/{JOB_INFO.unit}</p>
                      </div>
                    </div>
                    <p>
                      1.1 乙方（灵活用工者）同意按照甲方（用工企业）要求，在约定的服务期限内，
                      为甲方提供<span className="font-semibold text-gray-900">电子产品流水线装配作业</span>服务，
                      包括但不限于产品组装、质量检测、包装贴标等工作内容。
                    </p>
                    <p>
                      1.2 乙方工作地点为：<span className="font-semibold text-gray-900">{JOB_INFO.address}</span>。
                      乙方应按甲方要求的工作时间准时到岗，不得擅自离岗或缺勤。
                    </p>
                    <p>
                      1.3 服务期限自 <span className="font-semibold">{JOB_INFO.startDate}</span> 起至{' '}
                      <span className="font-semibold">{JOB_INFO.endDate}</span> 止，
                      共计约 <span className="font-semibold">181</span> 个自然日。
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      二
                    </span>
                    工时规则
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                      2.1 标准工时：每日工作 <span className="font-semibold">8</span> 小时，每周工作{' '}
                      <span className="font-semibold">6</span> 天，具体工作时间由甲方根据生产需要安排。
                    </p>
                    <p>
                      2.2 考勤方式：乙方须通过平台App进行人脸识别+定位的方式打卡考勤，
                      工作地点超出设定范围（500米）的打卡视为无效。
                    </p>
                    <p>
                      2.3 加班规定：甲方安排乙方加班的，应提前通知乙方并按{' '}
                      <span className="font-semibold">1.5倍</span>标准支付加班报酬；
                      法定节假日加班按 <span className="font-semibold">3倍</span>标准支付。
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      三
                    </span>
                    报酬标准与支付
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-gray-600">计件单价</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(JOB_INFO.rate)}
                          <span className="text-sm font-normal text-gray-500 ml-1">/ 件</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-center">
                        <div>
                          <p className="text-xs text-gray-500">日均产量</p>
                          <p className="font-semibold text-gray-900 mt-0.5">~800件</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">日均收入</p>
                          <p className="font-semibold text-emerald-600 mt-0.5">{formatCurrency(800 * JOB_INFO.rate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">月收入预估</p>
                          <p className="font-semibold text-gray-900 mt-0.5">{formatCurrency(800 * JOB_INFO.rate * 26)}</p>
                        </div>
                      </div>
                    </div>
                    <p>
                      3.1 报酬于每自然月结束后 <span className="font-semibold">5个工作日</span>内结算，
                      由丙方（平台）扣除依法应缴个人所得税后，通过银行转账方式支付至乙方绑定账户。
                    </p>
                    <p>
                      3.2 乙方应缴个人所得税由丙方按照<span className="font-semibold">劳务报酬所得</span>
                      项目依法代扣代缴，适用税率详见本协议第六条。
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      四
                    </span>
                    验收规则
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                      4.1 产品合格率须达到 <span className="font-semibold">99%以上</span>，
                      不合格产品不计入计件数量，乙方应在合理时间内无偿返工。
                    </p>
                    <p>
                      4.2 数量验收：每日下班前由甲方质检员与乙方共同核对当日完成数量，
                      双方通过平台App电子确认后的数据作为结算依据。
                    </p>
                    <p>
                      4.3 质量争议：对验收结果有异议的，可在24小时内向丙方平台申请复核，
                      平台裁定为最终结果。
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-red-100 text-red-700 rounded-full text-sm font-bold">
                      五
                    </span>
                    违约责任
                  </h3>
                  <div className="bg-red-50/50 rounded-xl p-5 border border-red-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <p>
                        5.1 乙方连续旷工 <span className="font-semibold">3天</span>以上的，
                        甲方有权单方解除本协议，且不承担任何违约责任。
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <p>
                        5.2 乙方故意损坏生产设备或产品的，应按实际损失向甲方承担赔偿责任，
                        丙方有权直接从报酬中扣除。
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <p>
                        5.3 甲方逾期支付报酬超过7日的，应按应付金额的
                        <span className="font-semibold">万分之五/日</span>向乙方支付违约金。
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                      六
                    </span>
                    个人所得税条款
                  </h3>
                  <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                      6.1 根据《个人所得税法》规定，乙方劳务报酬所得由丙方（平台）作为扣缴义务人
                      依法代扣代缴个人所得税。
                    </p>
                    <div className="grid grid-cols-3 gap-3 py-3">
                      <div className="bg-white rounded-lg p-3 text-center border border-amber-200/50">
                        <p className="text-xs text-gray-500">减除费用</p>
                        <p className="font-bold text-gray-900 mt-0.5">收入 × 20%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-amber-200/50">
                        <p className="text-xs text-gray-500">基础税率</p>
                        <p className="font-bold text-gray-900 mt-0.5">20% ~ 40%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-amber-200/50">
                        <p className="text-xs text-gray-500">汇算清缴</p>
                        <p className="font-bold text-gray-900 mt-0.5">次年3-6月</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      * 次年3月1日至6月30日，乙方可通过"个人所得税"APP办理综合所得汇算清缴，
                      多退少补。
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                      七
                    </span>
                    争议处理
                  </h3>
                  <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-100 space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                      7.1 因本协议引起的任何争议，三方应首先友好协商解决；
                      协商不成的，任何一方均可向丙方所在地有管辖权的人民法院提起诉讼。
                    </p>
                    <p>
                      7.2 本协议项下的所有电子数据、电子签名、区块链存证记录均具有法律效力，
                      三方同意以平台记录和存证数据作为解决争议的最终证据。
                    </p>
                  </div>
                </section>

                <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-200">
                  <p className="text-center text-xs text-gray-500 mb-6">
                    — 本协议共 <span className="font-semibold">7</span> 条，一式{' '}
                    <span className="font-semibold">3</span> 份，三方各执一份，具有同等法律效力 —
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="h-16 mb-3 flex items-center justify-center">
                        {contract.companySigned ? (
                          <div
                            className="px-4 py-2 rounded border-2 border-blue-500 text-blue-700 font-bold italic text-xl"
                            style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
                          >
                            {generateSignature(COMPANY_INFO.signName)}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs">（未签署）</div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">甲方（用工企业）</p>
                      <p className="text-xs text-gray-500 mt-1">{COMPANY_INFO.name}</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 mb-3 flex items-center justify-center">
                        {contract.workerSigned ? (
                          <div
                            className="px-4 py-2 rounded border-2 border-emerald-500 text-emerald-700 font-bold text-xl"
                            style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
                          >
                            {generateSignature(WORKER_INFO.signName)}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs">（未签署）</div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">乙方（灵活用工者）</p>
                      <p className="text-xs text-gray-500 mt-1">{WORKER_INFO.name}</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 mb-3 flex items-center justify-center">
                        {contract.platformSigned ? (
                          <div
                            className="px-4 py-2 rounded border-2 border-purple-500 text-purple-700 font-bold italic text-xl"
                            style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
                          >
                            {generateSignature(PLATFORM_INFO.operator)}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs">（未签署）</div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">丙方（服务平台）</p>
                      <p className="text-xs text-gray-500 mt-1">{PLATFORM_INFO.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <PenLine size={16} className="text-emerald-600" />
                三方签署进度
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">已完成</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {signedCount}
                    <span className="text-sm text-gray-400 font-normal"> / 3</span>
                  </p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 * (1 - signedCount / 3)}
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-600">
                      {Math.round((signedCount / 3) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                {['company', 'worker', 'platform'].map((r, i) => {
                  const signed =
                    (r === 'company' && contract.companySigned) ||
                    (r === 'worker' && contract.workerSigned) ||
                    (r === 'platform' && contract.platformSigned);
                  return (
                    <div key={r} className="flex items-center flex-1 last:flex-none">
                      <div
                        className={clsx(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                          signed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        {signed ? <Check size={14} /> : i + 1}
                      </div>
                      {i < 2 && (
                        <div
                          className={clsx(
                            'mx-1 h-0.5 flex-1 rounded',
                            (i === 0 && contract.workerSigned) ||
                            (i === 1 && contract.platformSigned)
                              ? 'bg-emerald-400'
                              : 'bg-gray-200'
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <SignArea
              role="company"
              title="企业签署"
              subtitle="用工企业 / 甲方"
              infoLines={[
                `企业名称：${COMPANY_INFO.name}`,
                `统一信用代码：${COMPANY_INFO.licenseNo}`,
                `联系人：${COMPANY_INFO.contact}`,
              ]}
              icon={<Building2 size={18} className="text-blue-600" />}
              signed={contract.companySigned}
              signName={COMPANY_INFO.signName}
              signTime={COMPANY_INFO.signTime}
              onSign={() => handleSign('company')}
              signing={signingRole === 'company'}
              bgColor="bg-blue-50/70"
              iconBg="bg-blue-100"
              borderColor="border-blue-200 bg-blue-50/30"
            />

            <SignArea
              role="worker"
              title="个人签署"
              subtitle="灵活用工者 / 乙方（您）"
              infoLines={[
                `姓　　名：${WORKER_INFO.name}`,
                `身份证号：${WORKER_INFO.idCard}`,
                `手机号码：${WORKER_INFO.phone}`,
              ]}
              icon={<UserCircle size={18} className="text-emerald-600" />}
              signed={contract.workerSigned}
              signName={WORKER_INFO.signName}
              signTime={WORKER_INFO.signTime}
              onSign={() => handleSign('worker')}
              signing={signingRole === 'worker'}
              bgColor="bg-emerald-50/70"
              iconBg="bg-emerald-100"
              borderColor="border-emerald-200 bg-emerald-50/30"
            />

            <SignArea
              role="platform"
              title="平台签署"
              subtitle="服务平台 / 丙方（见证方）"
              infoLines={[
                `平台名称：${PLATFORM_INFO.name}`,
                `运营商：灵活用工科技有限公司`,
                `签署人：${PLATFORM_INFO.operator}`,
              ]}
              icon={<Network size={18} className="text-purple-600" />}
              signed={contract.platformSigned}
              signName={PLATFORM_INFO.operator}
              signTime={PLATFORM_INFO.signTime}
              onSign={() => handleSign('platform')}
              signing={signingRole === 'platform'}
              bgColor="bg-purple-50/70"
              iconBg="bg-purple-100"
              borderColor="border-purple-200 bg-purple-50/30"
            />
          </div>

          {contract.blockchainHash && (
            <Card>
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-purple-600" />
                  区块链存证信息
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                      <Hash size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">交易哈希值</p>
                      <p className="text-xs font-mono text-gray-700 break-all mt-0.5 leading-relaxed">
                        {BLOCKCHAIN_INFO.hash}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyHash}
                    className="shrink-0"
                  >
                    {copiedHash ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Check size={12} />
                        已复制
                      </span>
                    ) : (
                      <Copy size={12} />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FileCheck size={11} />
                      存证编号
                    </p>
                    <p className="text-xs font-mono font-semibold text-gray-900 mt-1">
                      {BLOCKCHAIN_INFO.depositNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} />
                      上链时间
                    </p>
                    <p className="text-xs font-mono text-gray-700 mt-1">{BLOCKCHAIN_INFO.timestamp}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  已通过联盟链节点验证，数据不可篡改
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sign-highlight {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
        }
        .animate-sign-highlight { animation: sign-highlight 1.5s ease-out; }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }

        @keyframes success-slide {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          10%, 90% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -20px); opacity: 0; }
        }
        .animate-success-slide { animation: success-slide 3.5s ease-in-out forwards; }
      `}</style>
    </div>
  );
}

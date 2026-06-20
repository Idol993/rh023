import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Users,
  Wallet,
  Landmark,
  FileText,
  Building2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { formatCurrency, formatNumber, timeAgo } from '../../utils/format';
import { riskFlags, settlements, payouts, users, companies, tasks } from '../../mock/data';

const StatCard = ({
  title,
  value,
  icon,
  trend,
  gradientFrom,
  gradientTo,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: { value: number; isUp: boolean };
  gradientFrom: string;
  gradientTo: string;
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
  const isCurrency = value.includes('¥');

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * easeOut;
      if (isCurrency) {
        setDisplayValue(formatCurrency(current));
      } else {
        setDisplayValue(formatNumber(Math.round(current)));
      }
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue, isCurrency]);

  return (
    <div
      className="relative overflow-hidden rounded-xl p-5 border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-cyan-100/80">{title}</span>
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-white tracking-tight mb-3 tabular-nums">
          {displayValue}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ${
              trend.isUp
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {trend.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}%
          </span>
          <span className="text-xs text-cyan-100/60">较上月</span>
        </div>
      </div>
    </div>
  );
};

export default function Monitor() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const activeWorkers = users.filter((u) => u.role === 'worker').length * 128;
  const totalSettled = settlements.reduce((s, x) => s + x.totalBeforeTax, 0) * 45;
  const totalTax = settlements.reduce((s, x) => s + x.taxAmount, 0) * 52;
  const totalInvoice = (totalSettled + totalTax) * 0.98;
  const companyCount = companies.length * 86;
  const warningCount = riskFlags.length * 12;

  const payoutSuccess = payouts.filter((p) => p.status === 'success').length;
  const payoutTotal = payouts.length;
  const payoutRate = (payoutSuccess / payoutTotal) * 100;
  const taskCompleted = tasks.filter((t) => t.status === 'completed').length;
  const taskTotal = tasks.length;
  const taskCompleteRate = (taskCompleted / taskTotal) * 100;

  const monthlyTrendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      textStyle: { color: '#e2e8f0' },
      axisPointer: { type: 'cross', lineStyle: { color: 'rgba(6, 182, 212, 0.4)' } },
    },
    legend: {
      data: ['结算金额', '结算笔数'],
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(万)',
        nameTextStyle: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
        axisLabel: { color: '#94a3b8', formatter: '{value}' },
      },
      {
        type: 'value',
        name: '笔数',
        nameTextStyle: { color: '#94a3b8' },
        splitLine: { show: false },
        axisLabel: { color: '#94a3b8' },
      },
    ],
    series: [
      {
        name: '结算金额',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 3, color: '#06b6d4', shadowColor: 'rgba(6, 182, 212, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.4)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.02)' },
            ],
          },
        },
        data: [286, 312, 298, 385, 420, 512, 489, 556, 602, 578, 645, 712],
      },
      {
        name: '结算笔数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#34d399' },
        lineStyle: { width: 3, color: '#34d399', shadowColor: 'rgba(52, 211, 153, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52, 211, 153, 0.3)' },
              { offset: 1, color: 'rgba(52, 211, 153, 0.02)' },
            ],
          },
        },
        data: [1280, 1420, 1356, 1680, 1820, 2150, 2080, 2360, 2520, 2450, 2680, 2920],
      },
    ],
  };

  const workerTypeOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      textStyle: { color: '#e2e8f0' },
      formatter: '{b}: {c}人 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#94a3b8', fontSize: 12 },
    },
    title: {
      text: formatNumber(activeWorkers),
      subtext: '总在用人数',
      left: '25%',
      top: '38%',
      textAlign: 'center',
      textStyle: { color: '#06b6d4', fontSize: 28, fontWeight: 'bold' },
      subtextStyle: { color: '#94a3b8', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#0f172a', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: 4860, name: '技术工种', itemStyle: { color: '#06b6d4' } },
          { value: 3520, name: '仓储物流', itemStyle: { color: '#34d399' } },
          { value: 2890, name: '生产制造', itemStyle: { color: '#a78bfa' } },
          { value: 2180, name: 'IT研发', itemStyle: { color: '#fbbf24' } },
          { value: 1560, name: '其他灵活', itemStyle: { color: '#f472b6' } },
        ],
      },
    ],
  };

  const regionOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      textStyle: { color: '#e2e8f0' },
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['广东', '江苏', '浙江', '上海', '山东', '北京', '四川', '湖北', '河南', '福建'],
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        type: 'bar',
        barWidth: '45%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#06b6d4' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.2)' },
            ],
          },
        },
        data: [3280, 2850, 2640, 2420, 2180, 1980, 1720, 1560, 1420, 1280],
      },
    ],
  };

  const riskStackOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      textStyle: { color: '#e2e8f0' },
    },
    legend: {
      data: ['高风险', '中风险', '低风险'],
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        name: '高风险',
        type: 'bar',
        stack: 'total',
        barWidth: '40%',
        itemStyle: { color: '#ef4444', borderRadius: [0, 0, 0, 0] },
        data: [18, 22, 16, 28, 24, 32],
      },
      {
        name: '中风险',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#f59e0b' },
        data: [42, 38, 45, 52, 48, 56],
      },
      {
        name: '低风险',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
        data: [86, 92, 78, 105, 96, 112],
      },
    ],
  };

  const gaugeOption = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '85%',
        center: ['50%', '58%'],
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#06b6d4' },
              { offset: 1, color: '#34d399' },
            ],
          },
        },
        progress: { show: true, width: 14, roundCap: true },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 14, color: [[1, 'rgba(148, 163, 184, 0.15)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '0%'],
          fontSize: 32,
          fontWeight: 'bold',
          color: '#34d399',
          formatter: '{value}%',
        },
        data: [{ value: Math.round(payoutRate) }],
      },
    ],
  };

  const taskRingOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      textStyle: { color: '#e2e8f0' },
    },
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: Math.round(taskCompleteRate),
            name: '已完成',
            itemStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: '#a78bfa' },
                  { offset: 1, color: '#06b6d4' },
                ],
              },
            },
          },
          { value: 100 - Math.round(taskCompleteRate), name: '未完成', itemStyle: { color: 'rgba(148, 163, 184, 0.15)' } },
        ],
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: `${Math.round(taskCompleteRate)}%`,
          textAlign: 'center',
          fill: '#a78bfa',
          fontSize: 28,
          fontWeight: 'bold',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '58%',
        style: { text: '任务完成率', textAlign: 'center', fill: '#94a3b8', fontSize: 12 },
      },
    ],
  };

  const warningMessages = riskFlags
    .map((r) => ({
      id: r.id,
      level: r.level,
      desc: r.description,
      time: r.triggeredAt,
    }))
    .concat(
      riskFlags.map((r, i) => ({
        id: `${r.id}-ex${i}`,
        level: (['low', 'medium', 'high'] as const)[i % 3],
        desc: `企业${companies[i % companies.length]?.name || '某企业'}${r.type === 'location_abnormal' ? '打卡地点异常' : r.type === 'overtime_risk' ? '超时作业预警' : '合规风险提示'}`,
        time: new Date(Date.now() - i * 3600000).toISOString(),
      }))
    );

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full text-white"
      style={{
        background: 'linear-gradient(135deg, #0a0f1c 0%, #0f172a 25%, #1e293b 50%, #0f172a 75%, #0a0f1c 100%)',
      }}
    >
      <div className="relative">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <header className="relative px-8 py-5 border-b border-cyan-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <TrendingUp size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  灵活用工与薪税合规监管平台
                </h1>
                <p className="text-xs text-cyan-100/50 mt-0.5">Real-time Monitoring Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-cyan-100/70">
                <Clock size={18} className="text-cyan-400" />
                <span className="text-sm font-mono tabular-nums">
                  {currentTime.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all"
              >
                {isFullscreen ? (
                  <Minimize2 size={18} className="text-cyan-300" />
                ) : (
                  <Maximize2 size={18} className="text-cyan-300" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="relative px-8 py-6 space-y-6">
          <section className="grid grid-cols-6 gap-5">
            <StatCard
              title="活跃用工人数"
              value={formatNumber(activeWorkers)}
              icon={<Users size={20} />}
              trend={{ value: 12.8, isUp: true }}
              gradientFrom="rgba(6, 182, 212, 0.25)"
              gradientTo="rgba(6, 182, 212, 0.05)"
            />
            <StatCard
              title="累计结算金额"
              value={formatCurrency(totalSettled)}
              icon={<Wallet size={20} />}
              trend={{ value: 18.5, isUp: true }}
              gradientFrom="rgba(52, 211, 153, 0.25)"
              gradientTo="rgba(52, 211, 153, 0.05)"
            />
            <StatCard
              title="代征个税总额"
              value={formatCurrency(totalTax)}
              icon={<Landmark size={20} />}
              trend={{ value: 15.2, isUp: true }}
              gradientFrom="rgba(167, 139, 250, 0.25)"
              gradientTo="rgba(167, 139, 250, 0.05)"
            />
            <StatCard
              title="发票开具金额"
              value={formatCurrency(totalInvoice)}
              icon={<FileText size={20} />}
              trend={{ value: 17.3, isUp: true }}
              gradientFrom="rgba(251, 191, 36, 0.25)"
              gradientTo="rgba(251, 191, 36, 0.05)"
            />
            <StatCard
              title="注册企业数"
              value={formatNumber(companyCount)}
              icon={<Building2 size={20} />}
              trend={{ value: 8.6, isUp: true }}
              gradientFrom="rgba(96, 165, 250, 0.25)"
              gradientTo="rgba(96, 165, 250, 0.05)"
            />
            <StatCard
              title="预警数量"
              value={formatNumber(warningCount)}
              icon={<AlertTriangle size={20} />}
              trend={{ value: 5.2, isUp: false }}
              gradientFrom="rgba(239, 68, 68, 0.25)"
              gradientTo="rgba(239, 68, 68, 0.05)"
            />
          </section>

          <section className="grid grid-cols-2 gap-5">
            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cyan-100 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-emerald-400 rounded-full" />
                  月度结算趋势
                </h3>
              </div>
              <ReactECharts option={monthlyTrendOption} style={{ height: 280 }} />
            </div>

            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cyan-100 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
                  用工类型分布
                </h3>
              </div>
              <ReactECharts option={workerTypeOption} style={{ height: 280 }} />
            </div>

            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cyan-100 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-violet-400 to-cyan-400 rounded-full" />
                  地区分布TOP10
                </h3>
              </div>
              <ReactECharts option={regionOption} style={{ height: 280 }} />
            </div>

            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cyan-100 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-amber-400 to-red-400 rounded-full" />
                  风险预警统计
                </h3>
              </div>
              <ReactECharts option={riskStackOption} style={{ height: 280 }} />
            </div>
          </section>

          <section className="grid grid-cols-3 gap-5">
            <div className="col-span-2 rounded-xl border border-cyan-500/10 bg-slate-900/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-cyan-100 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-red-400 to-amber-400 rounded-full" />
                  实时预警消息
                </h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  实时更新中
                </span>
              </div>
              <div
                ref={marqueeRef}
                className="overflow-hidden relative h-56"
                onMouseEnter={() => {
                  if (marqueeRef.current) marqueeRef.current.style.animationPlayState = 'paused';
                }}
                onMouseLeave={() => {
                  if (marqueeRef.current) marqueeRef.current.style.animationPlayState = 'running';
                }}
              >
                <div
                  className="space-y-2"
                  style={{
                    animation: 'marquee 25s linear infinite',
                  }}
                >
                  {[...warningMessages, ...warningMessages].map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:border-cyan-500/20 transition-colors"
                    >
                      <span
                        className={`shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.level === 'high'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : item.level === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.level === 'high' ? '高危' : item.level === 'medium' ? '中危' : '低危'}
                      </span>
                      <p className="flex-1 text-sm text-slate-200/90 line-clamp-1">{item.desc}</p>
                      <span className="shrink-0 text-xs text-slate-400 tabular-nums">{timeAgo(item.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/40 backdrop-blur-sm p-5">
              <h3 className="text-base font-semibold text-cyan-100 flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
                平台运行指标
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-800/30 p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">发放成功率</span>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <ReactECharts option={gaugeOption} style={{ height: 150 }} />
                </div>
                <div className="rounded-lg bg-slate-800/30 p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">任务完成率</span>
                    <Target size={14} className="text-violet-400" />
                  </div>
                  <ReactECharts option={taskRingOption} style={{ height: 150 }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/10">
                  <div className="text-xs text-slate-400 mb-1">今日结算笔数</div>
                  <div className="text-xl font-bold text-cyan-300 tabular-nums">{formatNumber(328)}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10">
                  <div className="text-xs text-slate-400 mb-1">今日发放金额</div>
                  <div className="text-xl font-bold text-emerald-300 tabular-nums">¥{formatNumber(856420)}</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityStat, ApplyRate, DailyEvent, FilterStat, HeatCell, TagStat } from "@/lib/admin-stats";

type Props = {
  dailyEvents: DailyEvent[];
  activityRanking: ActivityStat[];
  applyRates: ApplyRate[];
  filterStats: FilterStat[];
  tagRanking: TagStat[];
  hourlyHeatmap: HeatCell[];
  publishedCount: number;
};

const NAVY = "#092040";
const HONEY = "#FCBC2A";
const SERIES_COLORS = [NAVY, "#2E5E8C", "#6384A8", HONEY];
const EVENT_LABELS: Record<string, string> = {
  page_view: "ページ閲覧",
  card_click: "カードクリック",
  apply_click: "応募クリック",
  filter_apply: "フィルター適用",
};
const FILTER_LABELS: Record<string, string> = {
  categories: "カテゴリ",
  grades: "学年",
  formats: "形式",
  periods: "活動期間",
  keyword: "キーワード",
};

const RANGES = [
  { label: "7日", days: 7 },
  { label: "30日", days: 30 },
  { label: "90日", days: 90 },
  { label: "全期間", days: 0 },
] as const;

// Week rows in the Japanese Monday-first order; values are Postgres dow (0=Sun..6=Sat).
const WEEK_ROWS = [
  { dow: 1, label: "月" },
  { dow: 2, label: "火" },
  { dow: 3, label: "水" },
  { dow: 4, label: "木" },
  { dow: 5, label: "金" },
  { dow: 6, label: "土" },
  { dow: 0, label: "日" },
] as const;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const numberFmt = new Intl.NumberFormat("ja-JP");
const formatDate = (value: string | number) => {
  const [, month, day] = String(value).split("-");
  return month && day ? `${Number(month)}/${Number(day)}` : String(value);
};

type TooltipEntry = { dataKey?: string | number; name?: string; value?: number | string; color?: string };

function BrandTooltip({
  active,
  payload,
  label,
  labelFormatter,
  nameMap,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  labelFormatter?: (value: string | number) => string;
  nameMap?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#092040]/15 bg-white px-3 py-2 text-xs shadow-[3px_3px_0_#092040]">
      {label !== undefined && label !== "" && (
        <p className="mb-1 font-black text-[#092040]">{labelFormatter ? labelFormatter(label) : label}</p>
      )}
      {payload.map((entry, index) => {
        const key = String(entry.dataKey ?? entry.name ?? index);
        const name = nameMap?.[key] ?? entry.name ?? key;
        return (
          <p key={key} className="flex items-center gap-2 text-[#092040]/80">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span>{name}</span>
            <span className="ml-auto font-bold text-[#092040]">
              {typeof entry.value === "number" ? numberFmt.format(entry.value) : entry.value}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#092040]/15 bg-white p-5 shadow-[4px_4px_0_#092040] sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-black">{title}</h2>
        {note && <span className="text-xs font-bold text-[#092040]/45">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  return <p className="py-12 text-center text-sm text-[#092040]/60">まだ表示できるデータがありません。</p>;
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous <= 0) return <span className="text-xs font-bold text-[#092040]/40">前期間比 —</span>;
  const pct = ((current - previous) / previous) * 100;
  const flat = Math.abs(pct) < 0.05;
  const up = pct > 0;
  const color = flat ? "text-[#092040]/50" : up ? "text-[#092040]" : "text-[#EF4444]";
  const arrow = flat ? "±" : up ? "▲" : "▼";
  return (
    <span className={`text-xs font-bold tabular-nums ${color}`}>
      前期間比 {arrow}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function KpiCard({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#092040]/15 bg-white p-4 shadow-[4px_4px_0_#092040] sm:p-5">
      <p className="text-xs font-bold tracking-wide text-[#092040]/55">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-[#092040] sm:text-3xl">{value}</p>
      {delta && <p className="mt-1">{delta}</p>}
      {sub && <p className="mt-0.5 text-xs text-[#092040]/50">{sub}</p>}
    </div>
  );
}

function Heatmap({ cells }: { cells: HeatCell[] }) {
  const byKey = new Map(cells.map((cell) => [`${cell.dow}-${cell.hour}`, cell.count]));
  const max = Math.max(1, ...cells.map((cell) => cell.count));
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid" style={{ gridTemplateColumns: `28px repeat(24, minmax(0, 1fr))` }}>
          <div />
          {HOURS.map((hour) => (
            <div key={hour} className="pb-1 text-center text-[10px] text-[#092040]/45">
              {hour % 3 === 0 ? hour : ""}
            </div>
          ))}
          {WEEK_ROWS.map((row) => (
            <div key={row.dow} className="contents">
              <div className="flex items-center pr-1 text-xs font-bold text-[#092040]/60">{row.label}</div>
              {HOURS.map((hour) => {
                const count = byKey.get(`${row.dow}-${hour}`) ?? 0;
                const ratio = count / max;
                const background =
                  count === 0 ? "rgba(9,32,64,0.04)" : `rgba(9,32,64,${(0.14 + ratio * 0.86).toFixed(3)})`;
                return (
                  <div
                    key={hour}
                    title={`${row.label}曜 ${hour}時 : ${numberFmt.format(count)} 閲覧`}
                    className="m-[1px] h-6 rounded-[3px]"
                    style={{ background }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FunnelStep({ label, value, share, prevShare }: { label: string; value: number; share: number; prevShare?: number }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-bold text-[#092040]">{label}</span>
        <span className="tabular-nums text-[#092040]/70">
          {numberFmt.format(value)}
          {prevShare !== undefined && <span className="ml-2 text-xs text-[#092040]/45">前段比 {prevShare.toFixed(1)}%</span>}
        </span>
      </div>
      <div className="h-7 overflow-hidden rounded-lg bg-[#092040]/8">
        <div
          className="flex h-full items-center rounded-lg bg-[#092040] px-3 text-xs font-bold text-white transition-[width]"
          style={{ width: `${Math.max(share, value > 0 ? 6 : 0)}%` }}
        >
          {share.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

export default function AdminCharts({
  dailyEvents,
  activityRanking,
  applyRates,
  filterStats,
  tagRanking,
  hourlyHeatmap,
  publishedCount,
}: Props) {
  const [rangeDays, setRangeDays] = useState<number>(30);

  // The database view performs the counting. This only pivots its already-counted
  // rows into Recharts' single-dataset shape, then narrows to the selected window.
  const eventTypes = useMemo(() => [...new Set(dailyEvents.map((event) => event.eventType))], [dailyEvents]);

  const sortedDates = useMemo(
    () => [...new Set(dailyEvents.map((event) => event.date))].sort((a, b) => a.localeCompare(b)),
    [dailyEvents],
  );

  const visibleDates = useMemo(() => {
    const window = rangeDays === 0 ? sortedDates : sortedDates.slice(-rangeDays);
    return new Set(window);
  }, [sortedDates, rangeDays]);

  const dailyData = useMemo(() => {
    const byDate = new Map<string, Record<string, string | number>>();
    for (const event of dailyEvents) {
      if (!visibleDates.has(event.date)) continue;
      const row = byDate.get(event.date) ?? { date: event.date };
      row[event.eventType] = event.count;
      byDate.set(event.date, row);
    }
    return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [dailyEvents, visibleDates]);

  const totals = useMemo(() => {
    const sum = { page_view: 0, card_click: 0, apply_click: 0, filter_apply: 0 } as Record<string, number>;
    for (const event of dailyEvents) {
      if (!visibleDates.has(event.date)) continue;
      sum[event.eventType] = (sum[event.eventType] ?? 0) + event.count;
    }
    return sum;
  }, [dailyEvents, visibleDates]);

  const prevTotals = useMemo(() => {
    const sum = { page_view: 0, card_click: 0, apply_click: 0 } as Record<string, number>;
    if (rangeDays === 0) return sum;
    const prevWindow = new Set(sortedDates.slice(-rangeDays * 2, -rangeDays));
    if (prevWindow.size === 0) return sum;
    for (const event of dailyEvents) {
      if (prevWindow.has(event.date)) sum[event.eventType] = (sum[event.eventType] ?? 0) + event.count;
    }
    return sum;
  }, [dailyEvents, sortedDates, rangeDays]);

  const showDelta = rangeDays !== 0;
  const pageViews = totals.page_view ?? 0;
  const cardClicks = totals.card_click ?? 0;
  const applyClicks = totals.apply_click ?? 0;
  const applyRate = pageViews > 0 ? (applyClicks / pageViews) * 100 : 0;
  const cardRate = pageViews > 0 ? (cardClicks / pageViews) * 100 : 0;
  const applyOfCard = cardClicks > 0 ? (applyClicks / cardClicks) * 100 : 0;
  const activeCount = activityRanking.filter((activity) => activity.viewCount > 0).length;
  const rangeLabel = RANGES.find((range) => range.days === rangeDays)?.label ?? "";

  const activityData = activityRanking.slice(0, 12).map((activity) => ({
    name: activity.title,
    閲覧: activity.viewCount,
    カードクリック: activity.cardClickCount,
    応募クリック: activity.applyClickCount,
  }));
  const tagData = tagRanking.slice(0, 12).map((tag) => ({ name: tag.tag, 閲覧: tag.viewCount }));
  const maxApplyRate = Math.max(1, ...applyRates.map((activity) => activity.applyRate));
  const filterGroups = Object.entries(
    filterStats.reduce<Record<string, FilterStat[]>>((groups, stat) => {
      (groups[stat.filterName] ??= []).push(stat);
      return groups;
    }, {}),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold text-[#092040]/55">期間</span>
        {RANGES.map((range) => {
          const active = range.days === rangeDays;
          return (
            <button
              key={range.days}
              type="button"
              onClick={() => setRangeDays(range.days)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                active
                  ? "border-[#092040] bg-[#092040] text-white"
                  : "border-[#092040]/20 bg-white text-[#092040]/60 hover:border-[#092040]/40"
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="ページ閲覧"
          value={numberFmt.format(pageViews)}
          sub={`直近${rangeLabel}`}
          delta={showDelta ? <DeltaBadge current={pageViews} previous={prevTotals.page_view ?? 0} /> : undefined}
        />
        <KpiCard
          label="カードクリック"
          value={numberFmt.format(cardClicks)}
          sub={`閲覧の${cardRate.toFixed(1)}%`}
          delta={showDelta ? <DeltaBadge current={cardClicks} previous={prevTotals.card_click ?? 0} /> : undefined}
        />
        <KpiCard
          label="応募クリック"
          value={numberFmt.format(applyClicks)}
          sub={`閲覧の${applyRate.toFixed(1)}%`}
          delta={showDelta ? <DeltaBadge current={applyClicks} previous={prevTotals.apply_click ?? 0} /> : undefined}
        />
        <KpiCard
          label="公開中の活動"
          value={numberFmt.format(publishedCount)}
          sub={`Notion公開中・うち閲覧あり${numberFmt.format(activeCount)}`}
        />
      </div>

      <ChartCard title="応募までのファネル" note={`直近${rangeLabel}`}>
        {pageViews === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <FunnelStep label="ページ閲覧" value={pageViews} share={100} />
            <FunnelStep label="カードクリック" value={cardClicks} share={cardRate} prevShare={cardRate} />
            <FunnelStep label="応募クリック" value={applyClicks} share={applyRate} prevShare={applyOfCard} />
          </div>
        )}
      </ChartCard>

      <ChartCard title="日別イベント推移（JST）" note={`直近${rangeLabel}`}>
        {dailyData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailyData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${NAVY}22`} />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: NAVY, fontSize: 12 }} minTickGap={24} />
              <YAxis allowDecimals={false} tick={{ fill: NAVY, fontSize: 12 }} />
              <Tooltip content={<BrandTooltip nameMap={EVENT_LABELS} labelFormatter={formatDate} />} />
              <Legend formatter={(value) => EVENT_LABELS[value] ?? value} />
              {eventTypes.map((eventType, index) => (
                <Line
                  key={eventType}
                  type="monotone"
                  dataKey={eventType}
                  stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="曜日×時間帯の閲覧（JST）" note="全期間">
        {hourlyHeatmap.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="mb-4 text-sm text-[#092040]/65">
              色が濃いほど閲覧が多い時間帯です。公開や告知のタイミングの参考に。
            </p>
            <Heatmap cells={hourlyHeatmap} />
          </>
        )}
      </ChartCard>

      <ChartCard title="活動ランキング（上位12件）" note="全期間">
        {activityData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={activityData} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${NAVY}22`} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: NAVY, fontSize: 11 }} />
              <Tooltip cursor={{ fill: `${NAVY}0d` }} content={<BrandTooltip />} />
              <Legend />
              <Bar dataKey="閲覧" fill={NAVY} radius={[0, 3, 3, 0]} />
              <Bar dataKey="カードクリック" fill="#6384A8" radius={[0, 3, 3, 0]} />
              <Bar dataKey="応募クリック" fill={HONEY} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard title="応募率（閲覧10回以上）" note="全期間">
          {applyRates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-[#092040]/60">
                  <tr>
                    <th className="pb-3">活動名</th>
                    <th className="pb-3 text-right">閲覧</th>
                    <th className="w-[38%] pb-3 pl-3">応募率</th>
                  </tr>
                </thead>
                <tbody>
                  {applyRates.map((activity) => (
                    <tr key={activity.activityId} className="border-t border-[#092040]/10">
                      <td className="py-3 pr-3 font-bold">{activity.title}</td>
                      <td className="py-3 text-right tabular-nums">{numberFmt.format(activity.viewCount)}</td>
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#092040]/8">
                            <div
                              className="h-full rounded-full bg-[#FCBC2A]"
                              style={{ width: `${(activity.applyRate / maxApplyRate) * 100}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right font-black tabular-nums">
                            {activity.applyRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="人気タグ（閲覧数・上位12件）" note="全期間">
          {tagData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={tagData} layout="vertical" margin={{ top: 4, right: 10, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${NAVY}22`} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: NAVY, fontSize: 12 }} />
                <Tooltip cursor={{ fill: `${NAVY}0d` }} content={<BrandTooltip />} />
                <Bar dataKey="閲覧" fill={HONEY} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="フィルター適用の内訳" note="全期間">
        <p className="mb-5 text-sm text-[#092040]/65">数値はユニークユーザー数ではなく、フィルターの適用回数です。</p>
        {filterGroups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filterGroups.map(([filterName, stats]) => {
              const data = stats.slice(0, 10).map((stat) => ({ name: stat.filterValue, 適用回数: stat.applyCount }));
              return (
                <div key={filterName} className="rounded-xl bg-[#FFFFF0] p-4">
                  <h3 className="mb-3 font-black">{FILTER_LABELS[filterName] ?? filterName}</h3>
                  <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis type="category" dataKey="name" width={105} tick={{ fill: NAVY, fontSize: 11 }} />
                      <Tooltip cursor={{ fill: `${NAVY}0d` }} content={<BrandTooltip />} />
                      <Bar dataKey="適用回数" fill={NAVY} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

"use client";

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
import type { ActivityStat, ApplyRate, DailyEvent, FilterStat, TagStat } from "@/lib/admin-stats";

type Props = {
  dailyEvents: DailyEvent[];
  activityRanking: ActivityStat[];
  applyRates: ApplyRate[];
  filterStats: FilterStat[];
  tagRanking: TagStat[];
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#092040]/15 bg-white p-5 shadow-[4px_4px_0_#092040] sm:p-6">
      <h2 className="mb-5 text-lg font-black">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState() {
  return <p className="py-12 text-center text-sm text-[#092040]/60">まだ表示できるデータがありません。</p>;
}

export default function AdminCharts({ dailyEvents, activityRanking, applyRates, filterStats, tagRanking }: Props) {
  // The database view performs the counting. This only pivots its already-counted
  // rows into Recharts' single-dataset shape.
  const eventTypes = [...new Set(dailyEvents.map((event) => event.eventType))];
  const dailyData = Array.from(
    dailyEvents.reduce((byDate, event) => {
      const row = byDate.get(event.date) ?? { date: event.date };
      row[event.eventType] = event.count;
      byDate.set(event.date, row);
      return byDate;
    }, new Map<string, Record<string, string | number>>()).values(),
  );
  const activityData = activityRanking.slice(0, 12).map((activity) => ({
    name: activity.title,
    閲覧: activity.viewCount,
    カードクリック: activity.cardClickCount,
    応募クリック: activity.applyClickCount,
  }));
  const tagData = tagRanking.slice(0, 12).map((tag) => ({ name: tag.tag, 閲覧: tag.viewCount }));
  const filterGroups = Object.entries(
    filterStats.reduce<Record<string, FilterStat[]>>((groups, stat) => {
      (groups[stat.filterName] ??= []).push(stat);
      return groups;
    }, {}),
  );

  return (
    <div className="space-y-8">
      <ChartCard title="日別イベント推移（JST）">
        {dailyData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailyData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${NAVY}22`} />
              <XAxis dataKey="date" tick={{ fill: NAVY, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: NAVY, fontSize: 12 }} />
              <Tooltip />
              <Legend formatter={(value) => EVENT_LABELS[value] ?? value} />
              {eventTypes.map((eventType, index) => (
                <Line key={eventType} type="monotone" dataKey={eventType} stroke={SERIES_COLORS[index % SERIES_COLORS.length]} strokeWidth={2.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="活動ランキング（上位12件）">
        {activityData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={activityData} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${NAVY}22`} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: NAVY, fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="閲覧" fill={NAVY} />
              <Bar dataKey="カードクリック" fill="#6384A8" />
              <Bar dataKey="応募クリック" fill={HONEY} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard title="応募率（閲覧10回以上）">
          {applyRates.length === 0 ? <EmptyState /> : (
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-[#092040]/60"><tr><th className="pb-3">活動名</th><th className="pb-3 text-right">閲覧</th><th className="pb-3 text-right">応募率</th></tr></thead>
                <tbody>{applyRates.map((activity) => <tr key={activity.activityId} className="border-t border-[#092040]/10"><td className="py-3 pr-3 font-bold">{activity.title}</td><td className="py-3 text-right">{activity.viewCount}</td><td className="py-3 text-right font-black">{activity.applyRate.toFixed(1)}%</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="人気タグ（閲覧数・上位12件）">
          {tagData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={tagData} layout="vertical" margin={{ top: 4, right: 10, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${NAVY}22`} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: NAVY, fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="閲覧" fill={HONEY} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="フィルター適用の内訳">
        <p className="mb-5 text-sm text-[#092040]/65">数値はユニークユーザー数ではなく、フィルターの適用回数です。</p>
        {filterGroups.length === 0 ? <EmptyState /> : (
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
                      <Tooltip />
                      <Bar dataKey="適用回数" fill={NAVY} />
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

import type { Metadata } from "next";
import AdminCharts from "./AdminCharts";
import {
  getActivityRanking,
  getApplyRates,
  getDailyEvents,
  getFilterStats,
  getHourlyHeatmap,
  getPublishedCount,
  getTagRanking,
} from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理分析ダッシュボード",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [dailyEvents, activityRanking, applyRates, filterStats, tagRanking, hourlyHeatmap, publishedCount] =
    await Promise.all([
      getDailyEvents(),
      getActivityRanking(),
      getApplyRates(),
      getFilterStats(),
      getTagRanking(),
      getHourlyHeatmap(),
      getPublishedCount(),
    ]);

  const updatedLabel = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#FFFFF0] px-4 py-10 text-[#092040] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-sm font-bold tracking-[0.18em] text-[#092040]/60">BEE LOG / INTERNAL</p>
            <h1 className="text-3xl font-black sm:text-4xl">分析ダッシュボード</h1>
          </div>
          <p className="text-xs text-[#092040]/50">最終更新 {updatedLabel} JST</p>
        </div>
        <AdminCharts
          dailyEvents={dailyEvents}
          activityRanking={activityRanking}
          applyRates={applyRates}
          filterStats={filterStats}
          tagRanking={tagRanking}
          hourlyHeatmap={hourlyHeatmap}
          publishedCount={publishedCount}
        />
      </div>
    </main>
  );
}

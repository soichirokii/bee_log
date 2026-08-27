import type { Metadata } from "next";
import AdminCharts from "./AdminCharts";
import {
  getActivityRanking,
  getApplyRates,
  getDailyEvents,
  getFilterStats,
  getTagRanking,
} from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理分析ダッシュボード",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [dailyEvents, activityRanking, applyRates, filterStats, tagRanking] = await Promise.all([
    getDailyEvents(),
    getActivityRanking(),
    getApplyRates(),
    getFilterStats(),
    getTagRanking(),
  ]);

  return (
    <main className="min-h-screen bg-[#FFFFF0] px-4 py-10 text-[#092040] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-sm font-bold tracking-[0.18em] text-[#092040]/60">BEE LOG / INTERNAL</p>
        <h1 className="mb-8 text-3xl font-black sm:text-4xl">分析ダッシュボード</h1>
        <AdminCharts
          dailyEvents={dailyEvents}
          activityRanking={activityRanking}
          applyRates={applyRates}
          filterStats={filterStats}
          tagRanking={tagRanking}
        />
      </div>
    </main>
  );
}

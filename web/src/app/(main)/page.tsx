import { Container } from "@/components/layouts/container";
import { BillsByTagSectionSkeleton } from "@/components/skeletons/bills-by-tag-section-skeleton";
import { CouncilSessionSkeleton } from "@/components/skeletons/council-session-skeleton";
import { FeaturedBillSectionSkeleton } from "@/components/skeletons/featured-bill-section-skeleton";

import { About } from "@/components/top/about";
import { CommitteeBanner } from "@/components/top/committee-banner";
import { GeneralQuestionsBanner } from "@/components/top/general-questions-banner";
import { Hero } from "@/components/top/hero";
import { PoliticiansBanner } from "@/components/top/politicians-banner";
import { TeamMirai } from "@/components/top/team-mirai";
import { TopicsBanner } from "@/components/top/topics-banner";

import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { FeaturedBillSection } from "@/features/bills/server/components/featured-bill-section";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";

import { CurrentCouncilSession } from "@/features/council-sessions/client/components/current-council-session";
import { getCurrentCouncilSession } from "@/features/council-sessions/server/loaders/get-current-council-session";
import { getNextCouncilSession } from "@/features/council-sessions/server/loaders/get-next-council-session";
import { getLatestSessionWithQuestions } from "@/features/general-questions/server/loaders/get-latest-session-with-questions";
import { InformationSection } from "@/features/information/server/components/information-section";
import { getJapanTime } from "@/lib/utils/date";

export default async function Home() {
  let billsByTag: any[] = [];
  let featuredBills: any[] = [];
  let articles: any[] = [];
  let currentSession: any = null;
  let nextSession: any = null;
  let latestQuestionsSlug: any = null;
  let loadError = false;
  let errorMessage = "";

  // First, try to load home data
  try {
    console.log("[DEBUG] Starting to load home data...");
    const homeData = await loadHomeData();
    console.log("[DEBUG] Home data loaded:", { hasData: !!homeData });
    billsByTag = homeData.billsByTag || [];
    featuredBills = homeData.featuredBills || [];
  } catch (error) {
    console.error("[DEBUG] Failed to load home data:", error);
    errorMessage =
      error instanceof Error ? error.message : "home data load failed";
    loadError = true;
  }

  // Load articles
  try {
    console.log("[DEBUG] Starting to load articles...");
    articles = await getPublishedArticles();
    console.log("[DEBUG] Articles loaded:", { count: articles.length });
  } catch (error) {
    console.error("[DEBUG] Failed to load articles:", error);
  }

  // Then, try to load session data
  try {
    console.log("[DEBUG] Starting to load council session data...");
    const current = await getCurrentCouncilSession(getJapanTime()).catch(
      (e) => {
        console.error("[DEBUG] getCurrentCouncilSession error:", e);
        return null;
      }
    );
    const next = await getNextCouncilSession(getJapanTime()).catch((e) => {
      console.error("[DEBUG] getNextCouncilSession error:", e);
      return null;
    });
    const latestQuestions = await getLatestSessionWithQuestions().catch((e) => {
      console.error("[DEBUG] getLatestSessionWithQuestions error:", e);
      return null;
    });

    console.log("[DEBUG] Session data loaded");
    currentSession = current;
    nextSession = next;
    latestQuestionsSlug = latestQuestions;
  } catch (error) {
    console.error("[DEBUG] Failed to load council session data:", error);
    if (!errorMessage) {
      errorMessage =
        error instanceof Error ? error.message : "session data load failed";
    }
    loadError = true;
  }

  return (
    <>
      {loadError && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
          <p className="font-bold">⚠️ データ読込エラー</p>
          <p className="text-sm">
            {errorMessage || "データベースからのデータ取得に失敗しました"}
          </p>
        </div>
      )}

      <Hero />

      {/* 本日の定例会セクション */}
      {loadError ? (
        <CouncilSessionSkeleton />
      ) : (
        <CurrentCouncilSession
          currentSession={currentSession}
          nextSession={nextSession}
        />
      )}

      {/* 一般質問バナー */}

      {latestQuestionsSlug && (
        <Container className="pt-6">
          <GeneralQuestionsBanner sessionSlug={latestQuestionsSlug} />
        </Container>
      )}

      <Container className="pt-6">
        <InformationSection />
      </Container>

      <Container className="pt-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-oita-pink-accent bg-oita-pink-light px-3 py-1 text-[10px] font-bold text-oita-pink">
            議会
          </span>

          <h2 className="text-2xl font-bold text-mirai-text md:text-3xl">
            議会で話し合われよんこと
          </h2>
        </div>
      </Container>

      {/* トピックスバナー */}

      {articles.length > 0 && (
        <Container className="pt-3">
          <TopicsBanner />
        </Container>
      )}

      {/* 委員会バナー */}

      <Container className="pt-3">
        <CommitteeBanner />
      </Container>

      {/* 議員紹介バナー */}

      <Container className="pt-3">
        <PoliticiansBanner />
      </Container>

      {/* 議案一覧セクション */}

      {(loadError || featuredBills.length > 0 || billsByTag.length > 0) && (
        <Container>
          <div className="py-10">
            <main className="flex flex-col gap-16">
              {/* 注目の議案セクション */}
              {loadError ? (
                <FeaturedBillSectionSkeleton />
              ) : (
                <FeaturedBillSection bills={featuredBills} />
              )}

              {/* タグ別議案一覧セクション */}
              {loadError ? (
                <BillsByTagSectionSkeleton />
              ) : (
                <BillsByTagSection billsByTag={billsByTag} />
              )}
            </main>
          </div>
        </Container>
      )}

      <Container>
        {/* みらい議会とは セクション */}

        <About />

        {/* チームみらいについて セクション */}

        <TeamMirai />

        <BillDisclaimer />
      </Container>
    </>
  );
}

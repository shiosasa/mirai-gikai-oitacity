import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/layouts/footer/footer";
import { MainLayout } from "@/components/layouts/main-layout";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <Header />
      <main className="min-h-dvh md:min-h-[calc(100dvh-96px)] bg-mirai-surface">
        {children}
      </main>
      <Footer />
    </MainLayout>
  );
}

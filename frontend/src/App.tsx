import React, { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPanelPage } from "@/pages/admin/AdminPanelPage";
import { AspirationPage } from "@/pages/public/AspirationPage";
import { HomePage } from "@/pages/public/HomePage";
import { NewsGalleryPage } from "@/pages/public/NewsGalleryPage";
import { OrganizationPage } from "@/pages/public/OrganizationPage";
import { ProkerPage } from "@/pages/public/ProkerPage";
import { TransparencyPage } from "@/pages/public/TransparencyPage";
import { HimakalaStoreProvider } from "@/services/himakala-store";

const queryClient = new QueryClient();

function RouteTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      document.title = "Beranda | HIMAKALA PENS PSDKU Lamongan";
    } else if (path.startsWith("/proker")) {
      document.title = "Program Kerja & Kalender | HIMAKALA PENS";
    } else if (path.startsWith("/transparansi")) {
      document.title = "Transparansi Kas & Pusat Dokumen | HIMAKALA PENS";
    } else if (path.startsWith("/organisasi") || path.startsWith("/tentang")) {
      document.title = "6 Divisi Kepengurusan | HIMAKALA PENS";
    } else if (path.startsWith("/berita")) {
      document.title = "Berita, Pengumuman & Galeri | HIMAKALA PENS";
    } else if (path.startsWith("/aspirasi")) {
      document.title = "Kirim & Lacak Aspirasi Mahasiswa | HIMAKALA PENS";
    } else if (path.startsWith("/admin")) {
      document.title = "Panel Admin Pengurus | HIMAKALA PENS";
    } else {
      document.title = "HIMAKALA PENS PSDKU Lamongan";
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HimakalaStoreProvider>
        <BrowserRouter>
          <RouteTitleUpdater />
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/proker" element={<ProkerPage />} />
              <Route path="/proker/:slug" element={<ProkerPage />} />
              <Route path="/transparansi" element={<TransparencyPage />} />
              <Route path="/transparansi/keuangan" element={<TransparencyPage />} />
              <Route path="/transparansi/dokumen" element={<TransparencyPage />} />
              <Route path="/organisasi" element={<OrganizationPage />} />
              <Route path="/tentang" element={<OrganizationPage />} />
              <Route path="/tentang/struktur" element={<OrganizationPage />} />
              <Route path="/tentang/arsip" element={<OrganizationPage />} />
              <Route path="/berita" element={<NewsGalleryPage />} />
              <Route path="/galeri" element={<NewsGalleryPage />} />
              <Route path="/aspirasi" element={<AspirationPage />} />
              <Route path="/aspirasi/kirim" element={<AspirationPage />} />
              <Route path="/aspirasi/lacak" element={<AspirationPage />} />
              <Route path="/kontak" element={<OrganizationPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/admin/*" element={<AdminPanelPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </HimakalaStoreProvider>
    </QueryClientProvider>
  );
}


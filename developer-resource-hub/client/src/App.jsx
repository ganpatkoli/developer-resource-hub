import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileNav from "./components/MobileNav";
import { useSettings } from "./context/SettingsContext";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const ReposPublic = lazy(() => import("./pages/Repos"));
const WebsitesPublic = lazy(() => import("./pages/WebsitesPublic"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));
const Signup = lazy(() => import("./pages/Signup"));
const CategoryManagementView = lazy(() => import("./pages/CategoryManagementView"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AddCategoryView = lazy(() => import("./pages/AddCategoryView"));
const GithubRepoManagementView = lazy(() => import("./pages/GithubRepoManagementView"));
const AddRepoView = lazy(() => import("./pages/AddRepoView"));
const ResearchManagementView = lazy(() => import("./pages/ResearchManagementView"));
const AddResearchView = lazy(() => import("./pages/AddResearchView"));
const ResearchPublic = lazy(() => import("./pages/ResearchPublic"));
const WebsiteManagementView = lazy(() => import("./pages/WebsiteManagementView"));
const AddWebsiteView = lazy(() => import("./pages/AddWebsiteView"));
const Favorites = lazy(() => import("./pages/Favorites"));
const AdminAds = lazy(() => import("./pages/AdminAds"));
const NewsPublic = lazy(() => import("./pages/NewsPublic"));
const ToolkitManagementView = lazy(() => import("./pages/ToolkitManagementView"));
const AddToolkitView = lazy(() => import("./pages/AddToolkitView"));
const ToolkitDetail = lazy(() => import("./pages/ToolkitDetail"));
const ToolkitsPublic = lazy(() => import("./pages/ToolkitsPublic"));

import UserProtectedRoute from "./components/UserProtectedRoute";

const SEO_BASE_URL = "https://aiguardian.cloud";
const SEO_DEFAULT_IMAGE = `${SEO_BASE_URL}/LOGO.png`;

const SEO_BY_ROUTE = {
  "/": {
    title: "AI Guardian Cloud | Repos, Websites, Research, News",
    description:
      "Discover curated GitHub repositories, websites, research papers, and technology intelligence on AI Guardian Cloud.",
  },
  "/repos": {
    title: "GitHub Repositories | AI Guardian Cloud",
    description:
      "Browse curated developer repositories with metadata, categories, and trending code resources.",
  },
  "/websites": {
    title: "Websites Directory | AI Guardian Cloud",
    description:
      "Explore curated websites for tools, platforms, documentation, and developer ecosystems.",
  },
  "/research": {
    title: "Research Papers | AI Guardian Cloud",
    description:
      "Access research submissions, technical insights, and curated papers for AI and software engineering.",
  },
  "/toolkits": {
    title: "Technical Toolkits | AI Guardian Cloud",
    description:
      "Access curated technical toolkits, resource hubs, and developer intelligence packages.",
  },
  "/news": {
    title: "Tech News Feed | AI Guardian Cloud",
    description:
      "Track the latest technology and AI news from curated global feeds in one place.",
  },
  "/login": {
    title: "Login | AI Guardian Cloud",
    description: "Sign in to AI Guardian Cloud.",
  },
  "/signup": {
    title: "Sign Up | AI Guardian Cloud",
    description: "Create your AI Guardian Cloud account.",
  },
};

function Layout({ children }) {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (settings?.security?.disableInspect) {
      const handleContextMenu = (e) => e.preventDefault();
      const handleKeyDown = (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.keyCode === 123 ||
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
          (e.ctrlKey && e.keyCode === 85)
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("contextmenu", handleContextMenu);
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("contextmenu", handleContextMenu);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [settings?.security?.disableInspect]);

  const isAdminPath = location.pathname.startsWith("/admin");
  const isAuthScreen = 
    location.pathname === "/login" || 
    location.pathname === "/signup" || 
    location.pathname === "/oauth/success";

  const showGlobalHeader = !isAuthScreen && !isAdminPath;
  const showGlobalFooter = !isAuthScreen && !isAdminPath;
  const showMobileNav = !isAuthScreen && !isAdminPath;
  const seo = SEO_BY_ROUTE[location.pathname] || SEO_BY_ROUTE["/"];

  const canonicalUrl = `${SEO_BASE_URL}${location.pathname}`;
  const shouldNoIndex = isAdminPath || isAuthScreen;
  const robotsValue = shouldNoIndex
    ? "noindex, nofollow, noarchive"
    : "index, follow, max-image-preview:large";

  const routeName =
    location.pathname === "/"
      ? "Home"
      : location.pathname.replace("/", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const collectionRoutes = new Set(["/repos", "/websites", "/research", "/news", "/toolkits"]);
  const pageType = collectionRoutes.has(location.pathname) ? "CollectionPage" : "WebPage";

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SEO_BASE_URL}/`,
    },
  ];
  if (location.pathname !== "/") {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: routeName,
      item: canonicalUrl,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SEO_BASE_URL}/#organization`,
        name: "AI Guardian Cloud",
        url: SEO_BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: SEO_DEFAULT_IMAGE,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SEO_BASE_URL}/#website`,
        url: SEO_BASE_URL,
        name: "AI Guardian Cloud",
        publisher: { "@id": `${SEO_BASE_URL}/#organization` },
      },
      {
        "@type": pageType,
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: seo.title,
        description: seo.description,
        isPartOf: { "@id": `${SEO_BASE_URL}/#website` },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };

  return (
    <div className={`min-h-screen flex flex-col ${isAdminPath ? "bg-[#10131a]" : ""}`}>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="robots" content={robotsValue} />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI Guardian Cloud" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={SEO_DEFAULT_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={SEO_DEFAULT_IMAGE} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      
      {showGlobalHeader && <Header />}
      <main className={`flex-1 ${showMobileNav ? "pb-24 lg:pb-0" : ""}`}>
        {children}
      </main>
      {showGlobalFooter && (
        <footer className="hidden lg:block border-t border-[#3b494b]/20 py-8 text-center text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase bg-[#10131a]">
          © 2026 AI Guardian Cloud // DISCOVERY_PLATFORM
        </footer>
      )}
      {showMobileNav && <MobileNav />}
    </div>
  );
}




const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0B0F19]">
    <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/repos" element={<ReposPublic />} />
          <Route path="/news" element={<NewsPublic />} />
          <Route path="/toolkits" element={<ToolkitsPublic />} />
          <Route path="/toolkits/:slug" element={<ToolkitDetail />} />
          <Route path="/websites" element={<WebsitesPublic />} />
          <Route path="/research" element={<ResearchPublic />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/success" element={<OAuthSuccess />} />
          <Route path="/user/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/user/dashboard"
            element={
              <UserProtectedRoute>
                <UserDashboard />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <UserProtectedRoute>
                <Favorites />
              </UserProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/admin/categories/new"
            element={
              <ProtectedRoute>
                <AddCategoryView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/repos"
            element={
              <ProtectedRoute>
                <GithubRepoManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/repos/new"
            element={
              <ProtectedRoute>
                <AddRepoView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/repos/:id/edit"
            element={
              <ProtectedRoute>
                <AddRepoView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/websites"
            element={
              <ProtectedRoute>
                <WebsiteManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/websites/new"
            element={
              <ProtectedRoute>
                <AddWebsiteView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/websites/:id/edit"
            element={
              <ProtectedRoute>
                <AddWebsiteView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/research"
            element={
              <ProtectedRoute>
                <ResearchManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/research/new"
            element={
              <ProtectedRoute>
                <AddResearchView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/research/:id/edit"
            element={
              <ProtectedRoute>
                <AddResearchView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <CategoryManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/toolkits"
            element={
              <ProtectedRoute>
                <ToolkitManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/toolkits/new"
            element={
              <ProtectedRoute>
                <AddToolkitView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/toolkits/:id/edit"
            element={
              <ProtectedRoute>
                <AddToolkitView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ads"
            element={
              <ProtectedRoute>
                <AdminAds />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Layout>
    </HelmetProvider>
  );
}

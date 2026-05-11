import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ReposPublic from "./pages/Repos";
import WebsitesPublic from "./pages/WebsitesPublic";
import AdminLogin from "./pages/AdminLogin"; // Unused now
import UserLogin from "./pages/UserLogin";
import UserProtectedRoute from "./components/UserProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
import OAuthSuccess from "./pages/OAuthSuccess";
import Signup from "./pages/Signup";
import CategoryManagementView from "./pages/CategoryManagementView";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AddCategoryView from "./pages/AddCategoryView";
import GithubRepoManagementView from "./pages/GithubRepoManagementView";
import AddRepoView from "./pages/AddRepoView";
import ResearchManagementView from "./pages/ResearchManagementView";
import AddResearchView from "./pages/AddResearchView";
import ResearchPublic from "./pages/ResearchPublic";
import WebsiteManagementView from "./pages/WebsiteManagementView";
import AddWebsiteView from "./pages/AddWebsiteView";
import Favorites from "./pages/Favorites";
import AdminAds from "./pages/AdminAds";
import NewsPublic from "./pages/NewsPublic";
import ToolkitManagementView from "./pages/ToolkitManagementView";
import AddToolkitView from "./pages/AddToolkitView";
import ToolkitDetail from "./pages/ToolkitDetail";
import ToolkitsPublic from "./pages/ToolkitsPublic";

import MobileNav from "./components/MobileNav";

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
  const location = useLocation();
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




export default function App() {
  return (
    <HelmetProvider>
      <Layout>
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
      </Layout>
    </HelmetProvider>
  );
}

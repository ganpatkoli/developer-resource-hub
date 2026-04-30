import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

import MobileNav from "./components/MobileNav";

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

  return (
    <div className={`min-h-screen flex flex-col ${isAdminPath ? "bg-[#10131a]" : ""}`}>
      {showGlobalHeader && <Header />}
      <main className={`flex-1 ${showMobileNav ? "pb-24 lg:pb-0" : ""}`}>
        {children}
      </main>
      {showGlobalFooter && (
        <footer className="hidden lg:block border-t border-[#3b494b]/20 py-8 text-center text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase bg-[#10131a]">
          © 2026 Developer Resource Hub // CYBER_DISCOVERY_PLATFORM
        </footer>
      )}
      {showMobileNav && <MobileNav />}
    </div>
  );
}




export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/repos" element={<ReposPublic />} />
        <Route path="/news" element={<NewsPublic />} />
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
  );
}

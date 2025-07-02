import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/layout/ScrollToTop';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/layout/CookieBanner';
import SessionsPage from './components/sessions/SessionsPage';
import PhotographerPage from './components/photographer/PhotographerPage';
import PhotographersPage from './components/photographers/PhotographersPage';
import SurfSchoolPage from './components/surfschool/SurfSchoolPage';
import SurfSchoolsPage from './components/surfschools/SurfSchoolsPage';
import SessionPage from './components/session/SessionPage';
import PhotographerProfile from './components/profile/PhotographerProfile';
import SurferProfile from './components/profile/SurferProfile';
import UploadSession from './components/upload/UploadSession';
import StripeOnboarding from './components/stripe/StripeOnboarding';
import StripeReturn from './components/stripe/StripeReturn';
import HowItWorksPage from './components/pages/HowItWorksPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import CartPage from './components/cart/CartPage';
import CheckoutSuccess from './components/checkout/CheckoutSuccess';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<SessionsPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/photographers" element={<PhotographersPage />} />
                <Route path="/photographer/:id" element={<PhotographerPage />} />
                <Route path="/surfschools" element={<SurfSchoolsPage />} />
                <Route path="/surfschool/:id" element={<SurfSchoolPage />} />
                <Route path="/session/:id" element={<SessionPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/photographerprofile/*" element={<PhotographerProfile />} />
                <Route path="/surfer/*" element={<SurferProfile />} />
                <Route path="/upload-session" element={<UploadSession />} />
                <Route path="/stripe-onboarding" element={<StripeOnboarding />} />
                <Route path="/stripe-return" element={<StripeReturn />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="*" element={<div className="container mx-auto p-8 text-center">Page not found</div>} />
              </Routes>
            </main>
            <Footer />
            <CookieBanner />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
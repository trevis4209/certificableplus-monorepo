/**
 * Login Page - Pagina di autenticazione per tutti i ruoli utente
 * 
 * Form di login responsive che gestisce l'autenticazione basata sui ruoli:
 * 
 * **URL Parameters:**
 * - role=company: Accesso dashboard aziendale 
 * - role=employee: Accesso dashboard dipendente mobile
 * 
 * **Design Pattern:**
 * - Split-screen design: Hero section + Form section
 * - Gradient background con logo placeholder
 * - Form validazione real-time con loading states
 * 
 * **Authentication Flow:**
 * 1. Parsing role da URL parameter
 * 2. Mock authentication tramite mockUsers
 * 3. Redirect role-based: /company/dashboard o /employee/dashboard
 * 4. Error handling con modal dialog
 * 
 * **Features:**
 * - Custom AuthInput components con icone
 * - Password visibility toggle
 * - Loading spinner durante autenticazione
 * - Error feedback tramite shadcn dialog
 * - Link a forgot-password e registrazione
 * 
 * **Mobile-First:** Responsive design con breakpoints lg: per tablet/desktop
 * 
 * **TODO:** Implementare autenticazione reale (NextAuth.js/Supabase)
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/custom/AuthInput";
import { Mail, Lock } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'company';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Create mock user data based on role
    const mockUser = {
      id: `user-${Date.now()}`,
      email: email || 'demo@example.com',
      name: 'Demo User',
      role: role as 'company' | 'employee' | 'viewer',
      companyId: 'company-1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save mock authentication data to localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
    localStorage.setItem('refreshToken', 'mock-refresh-token-' + Date.now());

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsLoading(false);

      // Allow login with any credentials - redirect based on role parameter
      if (role === 'company') {
        router.push('/company/dashboard');
      } else if (role === 'employee') {
        router.push('/employee/dashboard');
      } else {
        router.push('/');
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Top Section with Gradient */}
      <div 
        className="flex items-center justify-center w-full bg-gradient-to-b from-[#2A9D8F] to-white dark:to-black"
        style={{ height: '50vh', paddingTop: 120, paddingBottom: 60 }}
      >
        <div className="items-center text-center">
          {/* Logo Placeholder */}
          <div className="w-56 h-56 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <div className="text-6xl font-bold text-[#2A9D8F]">CP</div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Benvenuto
          </h1>
          <p className="text-lg md:text-xl text-gray-900 dark:text-gray-300 px-10 text-center">
            Accedi al tuo account business
          </p>
        </div>
      </div>

      {/* Bottom Section with Form */}
      <div className="flex-1 px-6 pt-8 bg-white dark:bg-black flex justify-center">
        <div className="w-full max-w-md lg:max-w-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <AuthInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={Mail}
              autoCapitalize="none"
            />

            {/* Password Input */}
            <AuthInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={Lock}
              showPasswordToggle={true}
            />

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link 
                href={`/auth/forgot-password?role=${role}`}
                className="text-[#2A9D8F] font-medium text-base lg:text-lg hover:underline"
              >
                Password dimenticata?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 py-4 lg:py-5 bg-[#2A9D8F] hover:bg-[#238B7C] text-white font-bold text-lg lg:text-2xl rounded-xl transition-opacity ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              {isLoading ? 'Accesso...' : 'Accedi'}
            </Button>

            {/* Register Link */}
            <div className="flex justify-center items-center space-x-1 pt-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Non hai un account?
              </span>
              <Link 
                href={`/auth/register?role=${role}`}
                className="font-semibold text-[#2A9D8F] text-sm lg:text-base hover:underline"
              >
                Registrati
              </Link>
            </div>
          </form>
          
          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:underline text-xl">
              ← Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F]"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
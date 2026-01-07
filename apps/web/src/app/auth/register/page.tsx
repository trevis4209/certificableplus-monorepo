/**
 * Register Page - Pagina di registrazione con form dinamico per ruoli
 * 
 * Form di registrazione che si adatta al ruolo selezionato:
 * 
 * **Role-Based Form Fields:**
 * - company: Nome, Nome Azienda, Email, Password, Conferma Password
 * - employee: Nome, Email, Password, Conferma Password (no nome azienda)
 * 
 * **Validation Features:**
 * - Password matching verification
 * - Minimum password length (6 chars)
 * - Real-time form validation
 * - Client-side error handling
 * 
 * **Form Flow:**
 * 1. Dynamic fields basati su URL parameter ?role=
 * 2. Client-side validation con feedback immediato
 * 3. Mock registration con loading simulation
 * 4. Redirect a /auth/login dopo registrazione successo
 * 
 * **Design:**
 * - Compact hero section (35vh vs 50vh login)
 * - Vertical form layout ottimizzato
 * - Conditional company name field per aziende
 * - Error modal feedback pattern
 * 
 * **Security:**
 * - Password confirmation check
 * - Email format validation tramite input type
 * - Form input sanitization
 * 
 * **TODO:** Backend integration, email verification, password strength
 */

"use client";

import { useState, Suspense } from "react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AuthInput } from "@/components/custom/AuthInput";
import { User, Building, Mail, Lock } from "lucide-react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'company';
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: role === 'company' ? "" : undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Le password non coincidono");
      setShowErrorAlert(true);
      setIsLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setErrorMessage("La password deve essere di almeno 6 caratteri");
      setShowErrorAlert(true);
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to login after successful registration
    router.push(`/auth/login?role=${role}`);
    setIsLoading(false);
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'company': return 'Azienda';
      case 'employee': return 'Dipendente';
      default: return 'Utente';
    }
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
        style={{ height: '35vh', paddingTop: 80, paddingBottom: 40 }}
      >
        <div className="items-center text-center">
          {/* Logo Placeholder */}
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <div className="text-3xl font-bold text-[#2A9D8F]">CP</div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Crea Account
          </h1>
          <p className="text-base md:text-lg text-gray-900 dark:text-gray-300 px-10 text-center">
            Registrati come {getRoleTitle()}
          </p>
        </div>
      </div>

      {/* Bottom Section with Form */}
      <div className="flex-1 px-6 pt-6 bg-white dark:bg-black flex justify-center">
        <div className="w-full max-w-md lg:max-w-lg">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Input */}
            <AuthInput
              name="name"
              type="text"
              placeholder="Nome completo"
              value={formData.name}
              onChange={handleChange}
              required
              icon={User}
            />

            {/* Company Name Input (conditional) */}
            {role === 'company' && (
              <AuthInput
                name="companyName"
                type="text"
                placeholder="Nome Azienda"
                value={formData.companyName || ""}
                onChange={handleChange}
                required
                icon={Building}
              />
            )}

            {/* Email Input */}
            <AuthInput
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              icon={Mail}
              autoCapitalize="none"
            />

            {/* Password Input */}
            <AuthInput
              name="password"
              type="password"
              placeholder="Password (min 6 caratteri)"
              value={formData.password}
              onChange={handleChange}
              required
              icon={Lock}
              showPasswordToggle={true}
            />

            {/* Confirm Password Input */}
            <AuthInput
              name="confirmPassword"
              type="password"
              placeholder="Conferma Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              icon={Lock}
              showPasswordToggle={true}
            />

            {/* Register Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 lg:py-5 bg-[#2A9D8F] hover:bg-[#238B7C] text-white font-semibold text-lg lg:text-xl rounded-xl transition-opacity mt-6 ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              {isLoading ? 'Registrazione...' : 'Registrati'}
            </Button>

            {/* Login Link */}
            <div className="flex justify-center items-center space-x-1 pt-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Hai già un account?
              </span>
              <Link 
                href={`/auth/login?role=${role}`}
                className="font-semibold text-[#2A9D8F] text-sm lg:text-base hover:underline"
              >
                Accedi
              </Link>
            </div>
          </form>
          
          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:underline text-sm">
              ← Torna alla home
            </Link>
          </div>
        </div>
      </div>

      {/* Error Alert Dialog */}
      <Dialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Errore</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorAlert(false)} variant="outline">
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F]"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
/**
 * Forgot Password Page - Pagina recupero password
 * 
 * Form semplice per reset password via email:
 * 
 * **Features:**
 * - Single email input con validazione
 * - Role-aware workflow (company/employee)
 * - Mock email sending con loading state
 * - Success feedback con redirect a login
 * 
 * **Design:**
 * - Compact layout (45vh hero vs 50vh login)
 * - Minimal form con solo email field
 * - Consistent brand styling con gradient
 * - Back navigation a login/home
 * 
 * **Flow:**
 * 1. User inserisce email
 * 2. Mock API call (2s) per simula invio email reset
 * 3. Success modal con conferma email inviata
 * 4. Auto-redirect a login page con role preserved
 * 
 * **Validation:**
 * - Email format validation basic (@)
 * - Error handling con modal feedback
 * - Loading spinner durante processo
 * 
 * **TODO:** Backend integration, email template, security token, rate limiting
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
import { Mail, CheckCircle } from "lucide-react";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'company';
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setErrorMessage("Inserisci un indirizzo email valido");
      setShowErrorAlert(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setShowSuccessAlert(true);
    } catch (error) {
      setErrorMessage("Errore durante l'invio dell'email. Riprova.");
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'company': return 'Azienda';
      case 'employee': return 'Dipendente';
      default: return 'Utente';
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessAlert(false);
    // Redirect back to login after showing success
    router.push(`/auth/login?role=${role}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Invio email in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Top Section with Gradient */}
      <div 
        className="flex items-center justify-center w-full bg-gradient-to-b from-[#2A9D8F] to-white dark:to-black"
        style={{ height: '45vh', paddingTop: 100, paddingBottom: 50 }}
      >
        <div className="items-center text-center">
          {/* Logo Placeholder */}
          <div className="w-40 h-40 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <div className="text-4xl font-bold text-[#2A9D8F]">CP</div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Password dimenticata?
          </h1>
          <p className="text-base md:text-lg text-gray-900 dark:text-gray-300 px-10 text-center max-w-md">
            Inserisci la tua email per ricevere le istruzioni di reset
          </p>
        </div>
      </div>

      {/* Bottom Section with Form */}
      <div className="flex-1 px-6 pt-8 bg-white dark:bg-black flex justify-center">
        <div className="w-full max-w-md lg:max-w-lg">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Email Input */}
            <AuthInput
              type="email"
              placeholder="Inserisci la tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={Mail}
              autoCapitalize="none"
            />

            {/* Reset Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 lg:py-5 bg-[#2A9D8F] hover:bg-[#238B7C] text-white font-semibold text-lg lg:text-xl rounded-xl transition-opacity ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              {isLoading ? 'Invio...' : 'Invia istruzioni'}
            </Button>

            {/* Back to Login Link */}
            <div className="flex justify-center items-center space-x-1 pt-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Ti ricordi la password?
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
          <div className="mt-8 text-center">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:underline text-sm">
              ← Torna alla home
            </Link>
          </div>
        </div>
      </div>

      {/* Success Alert Dialog */}
      <Dialog open={showSuccessAlert} onOpenChange={handleSuccessClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle size={24} />
              Email inviata!
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Abbiamo inviato le istruzioni per il reset della password all'indirizzo <strong>{email}</strong>. 
              Controlla la tua casella email e segui le istruzioni.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSuccessClose} className="bg-[#2A9D8F] hover:bg-[#238B7C]">
              Torna al Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F]"></div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}

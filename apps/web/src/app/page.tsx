/**
 * Homepage - Landing page principale di CertificablePlus
 * 
 * Pagina di benvenuto che presenta i tre percorsi principali dell'applicazione:
 * 
 * 1. **Azienda** (/auth/login?role=company)
 *    - Dashboard completo per gestione aziendale
 *    - CRUD dipendenti, prodotti, manutenzioni
 *    - Analytics e reportistica
 * 
 * 2. **Dipendente** (/auth/login?role=employee) 
 *    - App mobile-first per operazioni sul campo
 *    - Scanner QR, documentazione interventi
 *    - Navigazione GPS e operazioni offline
 * 
 * 3. **Vista Pubblica** (/public/view)
 *    - Accesso pubblico senza autenticazione
 *    - Catalogo prodotti e mappa interattiva
 *    - Landing page per QR code scansionati
 * 
 * Design: Server Component con gradient background, card-based navigation,
 * hover effects e responsive design per tutti i device.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, Shield, MapPin, Users, Package } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Certificable Plus</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-2xl mb-6 shadow-lg">
            <Shield className="w-8 h-8" />
            Certificable Plus
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestione Dispositivi Certificati
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Piattaforma avanzata per la gestione, tracciamento e manutenzione di dispositivi certificati 
            tramite tecnologie QR Code e NFC
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Azienda</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Dashboard completo per la gestione aziendale con analytics avanzati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Dipendenti</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>Prodotti</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Territorio</span>
                </div>
              </div>
              <Link href="/auth/login?role=company">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
                  Accedi come Azienda
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <Eye className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl text-secondary-foreground">Vista Pubblica</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Accesso pubblico per consultazione database e mappa interattiva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>Catalogo</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Mappa</span>
                </div>
              </div>
              <Link href="/public/view">
                <Button variant="secondary" className="w-full h-12 shadow-md hover:shadow-lg transition-all">
                  Accedi alla Vista Pubblica
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            Piattaforma sicura e certificata per la gestione professionale di dispositivi
          </p>
        </div>
      </div>
    </div>
  );
}

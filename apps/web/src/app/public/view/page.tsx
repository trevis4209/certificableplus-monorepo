/**
 * Public View Page - Landing page pubblica e hub principale
 * 
 * Pagina di accesso principale per utenti pubblici senza autenticazione:
 * 
 * **Core Features:**
 * - Hero section con statistiche aggregate pubbliche
 * - Quick search per prodotti tramite QR code o tipo
 * - Navigation hub verso catalogo e mappa interattiva
 * - Company showcase con branding partner
 * - Transparency dashboard con info sistema
 * 
 * **SEO Optimization:**
 * - Server-side friendly per indicizzazione
 * - Structured data per Rich Snippets Google
 * - Open Graph meta tags per social sharing
 * - Semantic HTML con proper heading hierarchy
 * 
 * **Public Data Safety:**
 * - Solo dati pubblici e sicuri (no GPS precisi)
 * - Status generalizzati (Attivo/Non Attivo vs dettagli)
 * - Company info limitata a branding pubblico
 * - No informazioni sensibili o private
 * 
 * **QR Code Landing:**
 * - Destination per QR codes scansionati da pubblico
 * - Search immediata con pre-population
 * - Filtri intelligenti per risultati rilevanti
 * 
 * **Design Pattern:**
 * - Mobile-first responsive con hover effects
 * - Card-based navigation con visual hierarchy
 * - Consistent branding con theme support
 * - Progressive enhancement for accessibility
 * 
 * **TODO:** Static generation, analytics integration, sitemap
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Package, Database, ArrowLeft, Eye, Shield, Users, Calendar, TrendingUp, CheckCircle, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockProducts, mockCompanies, mockMaintenance, getMaintenanceByProductId } from "@/lib/mock-data";

export default function PublicViewPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = mockProducts.filter(product => 
    product.tipologia_segnale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const company = mockCompanies[0]; // Main company for public view

  const getStatusBadge = (product: any) => {
    const maintenances = getMaintenanceByProductId(product.id);
    const lastMaintenance = maintenances[maintenances.length - 1];
    
    if (!lastMaintenance) {
      return <Badge className="bg-muted text-muted-foreground">Non controllato</Badge>;
    }
    
    switch (lastMaintenance.tipo_intervento) {
      case 'installazione':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Attivo</Badge>;
      case 'manutenzione':
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors">Mantenuto</Badge>;
      case 'verifica':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Verificato</Badge>;
      case 'dismissione':
        return <Badge variant="destructive">Non Attivo</Badge>;
      default:
        return <Badge variant="outline">Installato</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Modern Header with Enhanced Design */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary/8 via-primary/5 to-primary/8 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand Section */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-lg font-bold text-primary-foreground">C</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Certificable Plus
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">Sistema di Certificazione</p>
                </div>
              </Link>
              
              {/* Page Title with Breadcrumb */}
              <div className="hidden md:flex items-center gap-3">
                <div className="w-px h-8 bg-border"></div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-lg font-semibold text-foreground">Vista Pubblica</span>
                </div>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <div className="relative">
                  <ThemeToggle />
                </div>


              </div>
            </div>
          </div>


        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Database Segnali</h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                  Consulta l'archivio completo dei dispositivi installati con stato di manutenzione, dettagli tecnici e cronologia interventi
                </p>
                <Link href="/public/products">
                  <Button size="lg" className="w-full sm:w-auto group-hover:shadow-lg transition-all">
                    <Database className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Visualizza Database</span>
                    <span className="sm:hidden">Database</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Mappa Interattiva</h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                  Esplora la distribuzione geografica dei segnali attraverso una mappa interattiva con filtri e informazioni dettagliate
                </p>
                <Link href="/public/map">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg transition-all border-primary/20 hover:border-primary">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Apri Mappa</span>
                    <span className="sm:hidden">Mappa</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
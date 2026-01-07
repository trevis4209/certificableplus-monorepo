"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, MapPin, Eye, Download, Grid3X3, List, LayoutGrid } from "lucide-react";
import { mockProducts, mockCompanies, mockMaintenance, getMaintenanceByProductId } from "@/lib/mock-data";
import { ProductCardList } from "@/components/custom/ProductCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PublicProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards'); // Default to cards

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.tipo_segnale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.forma.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
      product.tipo_segnale.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (product: any) => {
    const maintenances = getMaintenanceByProductId(product.id);
    const lastMaintenance = maintenances[maintenances.length - 1];
    
    if (!lastMaintenance) {
      return <Badge variant="secondary">Non verificato</Badge>;
    }
    
    switch (lastMaintenance.tipo_intervento) {
      case 'installazione':
        return <Badge className="bg-green-100 text-green-800">Attivo</Badge>;
      case 'manutenzione':
        return <Badge className="bg-blue-100 text-blue-800">Mantenuto</Badge>;
      case 'verifica':
        return <Badge className="bg-yellow-100 text-yellow-800">Verificato</Badge>;
      case 'dismissione':
        return <Badge variant="destructive">Non Attivo</Badge>;
      default:
        return <Badge variant="outline">Installato</Badge>;
    }
  };

  // Handler per le card
  const handleCardClick = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      window.open(`/public/product/${product.qr_code}`, '_blank');
    }
  };


  const handleMaintenanceClick = (productId: string) => {
    // Per utenti pubblici, redirect a login
    window.open('/auth/login?role=employee', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header con Toggle View */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-3 sm:py-0 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/public/view">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Indietro</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Database Segnali</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vista pubblica</p>
              </div>
            </div>
            
            {/* View Toggle + Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8"
                >
                  <List className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Tabella</span>
                </Button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca per tipo, QR code o forma..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tipo segnale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="pericolo">Pericolo</SelectItem>
                    <SelectItem value="obbligo">Obbligo</SelectItem>
                    <SelectItem value="divieto">Divieto</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="shrink-0">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Report PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conditional View: Cards or Table */}
          {viewMode === 'cards' ? (
            /* Card View - Responsive Grid */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Segnali Installati ({filteredProducts.length})
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vista card responsive
                </p>
              </div>
              
              <ProductCardList
                products={filteredProducts}
                companies={mockCompanies}
                maintenances={mockMaintenance}
                onCardClick={handleCardClick}
                onMaintenanceClick={handleMaintenanceClick}
                showActions={true}
                showCompanyInfo={true}
                emptyMessage="Nessun segnale trovato con i filtri correnti"
              />
            </div>
          ) : (
            /* Table View - Traditional */
            <Card>
            <CardHeader>
              <CardTitle>Segnali Installati ({filteredProducts.length})</CardTitle>
              <CardDescription>
                Database pubblico dei dispositivi di segnaletica certificati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Tipo Segnale</TableHead>
                      <TableHead>Anno</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead>Dimensioni</TableHead>
                      <TableHead>Materiale</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>GPS</TableHead>
                      <TableHead>Installato</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">
                          {product.qr_code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.tipo_segnale}
                        </TableCell>
                        <TableCell>{product.anno}</TableCell>
                        <TableCell>{product.forma}</TableCell>
                        <TableCell>{product.dimensioni}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{product.materiale_supporto}</div>
                            <div className="text-gray-500 dark:text-gray-400">{product.spessore_supporto}mm</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(product)}</TableCell>
                        <TableCell>
                          {product.gps_lat && product.gps_lng ? (
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-green-600">Disponibile</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(product.createdAt).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Nessun segnale trovato con i criteri di ricerca</p>
                </div>
              )}
            </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {filteredProducts.filter(p => {
                      const m = getMaintenanceByProductId(p.id);
                      return m.some(maintenance => maintenance.tipo_intervento === 'installazione');
                    }).length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Attivi</p>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {filteredProducts.filter(p => p.gps_lat && p.gps_lng).length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">GPS</p>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {filteredProducts.filter(p => getMaintenanceByProductId(p.id).length === 0).length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Da verificare</p>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{filteredProducts.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Totale</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const product = mockProducts.find(p => p.id === selectedProduct);
              const maintenances = getMaintenanceByProductId(selectedProduct);
              
              if (!product) return null;
              
              return (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold dark:text-white">{product.tipo_segnale}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">QR: {product.qr_code}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProduct(null)}
                      className="w-full sm:w-auto"
                    >
                      Chiudi
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold dark:text-white">Caratteristiche Tecniche</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Anno:</dt>
                          <dd>{product.anno}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Forma:</dt>
                          <dd>{product.forma}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Dimensioni:</dt>
                          <dd>{product.dimensioni}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Materiale:</dt>
                          <dd>{product.materiale_supporto}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Spessore:</dt>
                          <dd>{product.spessore_supporto}mm</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Pellicola:</dt>
                          <dd>{product.materiale_pellicola}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold dark:text-white">Stato e Posizione</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Stato attuale:</span><br />
                          {getStatusBadge(product)}
                        </div>
                        
                        {product.gps_lat && product.gps_lng && (
                          <div>
                            <span className="text-sm text-gray-600">Posizione GPS:</span><br />
                            <span className="text-sm font-mono">
                              {product.gps_lat.toFixed(6)}, {product.gps_lng.toFixed(6)}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm text-gray-600">Installato il:</span><br />
                          <span className="text-sm">
                            {new Date(product.createdAt).toLocaleDateString('it-IT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {maintenances.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Ultimo controllo:</span><br />
                            <span className="text-sm">
                              {new Date(maintenances[maintenances.length - 1].createdAt).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {product.figura && (
                    <div className="mb-4">
                      <h4 className="font-semibold dark:text-white mb-2">Immagine del Segnale</h4>
                      <img 
                        src={product.figura} 
                        alt={product.tipo_segnale}
                        className="w-full max-w-md mx-auto rounded border"
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
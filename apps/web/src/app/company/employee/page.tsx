/**
 * Company Employee Management Page - CRUD dipendenti aziendali
 * 
 * Gestione completa team aziendale con operazioni CRUD:
 * 
 * **Core Features:**
 * - Lista dipendenti con search e filtering
 * - Add/Edit/Delete employee operations
 * - Status management (attivo/inattivo)
 * - Role assignment e permissions
 * - Performance tracking basic
 * 
 * **Employee Management:**
 * - Modal forms per creation/editing
 * - Email validation e unique constraints
 * - Department assignment (future)
 * - Contact info e emergency contacts
 * 
 * **Performance Metrics:**
 * - Maintenance completate per dipendente
 * - Products lavorati e expertise areas
 * - Timeline attività e productivity trends
 * - Team collaboration metrics
 * 
 * **Business Logic:**
 * - Company-scoped employee access
 * - Audit trail per modifiche
 * - Integration con maintenance assignments
 * - Bulk operations per team management
 * 
 * **TODO:** Real CRUD, email invitations, advanced permissions, org chart
 */

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye, Plus, Users, Mail, Calendar, MapPin, Wrench, Package } from "lucide-react";
import { mockUsers, mockMaintenance, mockProducts } from "@/lib/mock-data";
import { usePageHeader, useHeaderButtons } from "@/contexts";

export default function CompanyEmployeePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Configurazione buttons per actions
  const buttonHandlers = useMemo(() => ({
    'add-employee': () => alert("Nuovo dipendente da implementare")
  }), []);
  
  const createHeaderButtons = useHeaderButtons(buttonHandlers);
  const buttons = useMemo(() => createHeaderButtons([
    { 
      id: 'add-employee', 
      label: 'Nuovo Dipendente', 
      mobileLabel: 'Nuovo', 
      icon: Plus 
    }
  ]), [createHeaderButtons]);

  // Configura header tramite context
  const headerConfig = useMemo(() => ({
    icon: Users,
    title: "Gestione Dipendenti",
    description: "Gestione completa del team aziendale",
    buttons
  }), [buttons]);
  
  usePageHeader(headerConfig);

  // Filtra solo i dipendenti
  const employees = mockUsers.filter(user => user.role === 'employee');
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "active" && employee.isActive) ||
      (filterStatus === "inactive" && !employee.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    alert("Export report dipendenti da implementare");
  };

  const getEmployeeStats = (employeeId: string) => {
    const employeeMaintenance = mockMaintenance.filter(m => m.userId === employeeId);
    const lastMaintenance = employeeMaintenance[employeeMaintenance.length - 1];
    
    return {
      totalMaintenance: employeeMaintenance.length,
      lastActivity: lastMaintenance ? new Date(lastMaintenance.createdAt) : null,
      activeProducts: new Set(employeeMaintenance.map(m => m.productId)).size
    };
  };

  const getStatusBadge = (employee: any) => {
    const stats = getEmployeeStats(employee.id);
    const daysSinceLastActivity = stats.lastActivity 
      ? Math.floor((Date.now() - stats.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!employee.isActive) {
      return <Badge className="bg-muted text-muted-foreground">Inattivo</Badge>;
    }

    if (!stats.lastActivity) {
      return <Badge className="bg-muted text-muted-foreground">Mai operativo</Badge>;
    }

    if (daysSinceLastActivity! <= 7) {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Molto attivo</Badge>;
    } else if (daysSinceLastActivity! <= 30) {
      return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors">Attivo</Badge>;
    } else {
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Poco attivo</Badge>;
    }
  };

  // Statistiche generali
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.isActive).length,
    totalMaintenance: mockMaintenance.length,
    avgMaintenancePerEmployee: Math.round(mockMaintenance.length / employees.length)
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Dipendenti</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Attivi</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.activeEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Interventi</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalMaintenance}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Media/Dip.</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.avgMaintenancePerEmployee}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o email..."
                  className="pl-10 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px] hover:bg-primary/5">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="active">Attivi</SelectItem>
                  <SelectItem value="inactive">Inattivi</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="shrink-0 hover:bg-primary/10">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Esporta</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
          {filteredEmployees.map((employee) => {
            const stats = getEmployeeStats(employee.id);
            return (
              <Card key={employee.id} className="cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200"
                    onClick={() => setSelectedEmployee(employee.id)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{employee.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </p>
                    </div>
                    {getStatusBadge(employee)}
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Interventi:</span>
                      <span className="text-foreground font-medium">{stats.totalMaintenance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prodotti gestiti:</span>
                      <span className="text-foreground font-medium">{stats.activeProducts}</span>
                    </div>
                    {stats.lastActivity && (
                      <div className="flex items-center gap-1 pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Ultimo: {stats.lastActivity.toLocaleDateString('it-IT')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Desktop Table */}
        <Card className="hidden md:block transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              Dipendenti ({filteredEmployees.length})
            </CardTitle>
            <CardDescription>
              Elenco completo del personale con statistiche attività
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Interventi</TableHead>
                    <TableHead>Prodotti</TableHead>
                    <TableHead>Ultimo Accesso</TableHead>
                    <TableHead>Data Assunzione</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const stats = getEmployeeStats(employee.id);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {employee.email}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(employee)}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Wrench className="h-3 w-3 text-muted-foreground mr-1" />
                            <span className="text-foreground font-medium">{stats.totalMaintenance}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Package className="h-3 w-3 text-muted-foreground mr-1" />
                            <span className="text-foreground font-medium">{stats.activeProducts}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {stats.lastActivity ? (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                              <span className="text-foreground">{stats.lastActivity.toLocaleDateString('it-IT')}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Mai</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground text-sm">
                            {new Date(employee.createdAt).toLocaleDateString('it-IT')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(employee.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Nessun dipendente trovato</p>
                <p className="text-muted-foreground/80 text-sm mt-2">Prova a modificare i criteri di ricerca</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Employee Details Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {(() => {
            const employee = mockUsers.find(u => u.id === selectedEmployee);
            const employeeMaintenance = selectedEmployee ? mockMaintenance.filter(m => m.userId === selectedEmployee) : [];
            
            if (!employee) return null;
            
            const stats = getEmployeeStats(employee.id);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-primary flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    {employee.name}
                  </DialogTitle>
                  <DialogDescription>
                    Email: <span className="font-medium text-foreground">{employee.email}</span>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Informazioni Personale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">Stato:</dt>
                          <dd>{getStatusBadge(employee)}</dd>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">Assunto il:</dt>
                          <dd className="text-foreground font-semibold">
                            {new Date(employee.createdAt).toLocaleDateString('it-IT')}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">ID Sistema:</dt>
                          <dd className="text-foreground font-mono text-sm">{employee.id}</dd>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <dt className="text-muted-foreground font-medium">Ruolo:</dt>
                          <dd className="text-foreground font-semibold capitalize">{employee.role}</dd>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        Statistiche Attività
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">Interventi totali:</dt>
                          <dd className="text-foreground font-semibold">{stats.totalMaintenance}</dd>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">Prodotti gestiti:</dt>
                          <dd className="text-foreground font-semibold">{stats.activeProducts}</dd>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <dt className="text-muted-foreground font-medium">Ultima attività:</dt>
                          <dd className="text-foreground font-semibold">
                            {stats.lastActivity ? stats.lastActivity.toLocaleDateString('it-IT') : 'Mai'}
                          </dd>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Cronologia Interventi ({employeeMaintenance.length})
                    </CardTitle>
                    <CardDescription>
                      Ultimi interventi eseguiti dal dipendente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {employeeMaintenance.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {employeeMaintenance.slice(-10).reverse().map((maintenance) => {
                          const product = mockProducts.find(p => p.id === maintenance.productId);
                          return (
                            <div key={maintenance.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="font-medium capitalize text-foreground">
                                    {maintenance.tipo_intervento}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {product?.tipo_segnale} • QR: {product?.qr_code}
                                  </div>
                                </div>
                                <Badge className="bg-primary/10 text-primary text-xs">
                                  {new Date(maintenance.createdAt).toLocaleDateString('it-IT')}
                                </Badge>
                              </div>
                              {maintenance.note && (
                                <div className="text-muted-foreground/80 text-xs p-2 bg-background/50 rounded border-l-2 border-primary/30">
                                  {maintenance.note}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Nessun intervento registrato</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}

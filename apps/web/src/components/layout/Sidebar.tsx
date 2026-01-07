"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@certplus/utils";
import { Home, Users, Package, Wrench, Map, Plus, List, Edit, Building2, User as UserIcon, Settings, LogOut, ChevronDown, ChevronRight, X, Sun, Moon } from "lucide-react";
import type { User } from "@certplus/types";
import { useState, useEffect, memo, useCallback, useMemo, useReducer } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import dynamic from 'next/dynamic';
import { Suspense } from "react";

const ProductModal = dynamic(() => import("@/components/modals/ProductModal").then(mod => ({ default: mod.ProductModal })), {
  loading: () => <div className="animate-pulse bg-muted/50 rounded-lg h-96 w-full" />
});

const EmployeeModal = dynamic(() => import("@/components/modals/EmployeeModal").then(mod => ({ default: mod.EmployeeModal })), {
  loading: () => <div className="animate-pulse bg-muted/50 rounded-lg h-96 w-full" />
});

const MaintenanceModal = dynamic(() => import("@/components/modals/MaintenanceModal").then(mod => ({ default: mod.MaintenanceModal })), {
  loading: () => <div className="animate-pulse bg-muted/50 rounded-lg h-96 w-full" />
});

// Memoized components for better performance
const MemoizedSidebarLink = memo(function SidebarLink({ 
  item, 
  isActive, 
  handleLinkClick 
}: { 
  item: SidebarItem; 
  isActive: boolean; 
  handleLinkClick: () => void;
}) {
  const Icon = item.icon;
  
  return (
    <div className="space-y-2">
      <Link
        href={item.href!}
        onClick={handleLinkClick}
        suppressHydrationWarning
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <div className={cn(
          "w-5 h-5 transition-transform duration-200",
          !isActive && "group-hover:scale-110"
        )}>
          <Icon className="w-full h-full" />
        </div>
        {item.label}
        {isActive && (
          <div suppressHydrationWarning className="w-1.5 h-1.5 bg-sidebar-primary-foreground rounded-full ml-auto"></div>
        )}
      </Link>
    </div>
  );
});

// Modal state management types
type ModalState = {
  showCompanyDialog: boolean;
  showProductModal: boolean;
  showEmployeeModal: boolean;
  showMaintenanceModal: boolean;
};

type ModalAction = 
  | { type: 'OPEN_COMPANY_DIALOG' }
  | { type: 'OPEN_PRODUCT_MODAL' }
  | { type: 'OPEN_EMPLOYEE_MODAL' }
  | { type: 'OPEN_MAINTENANCE_MODAL' }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'CLOSE_COMPANY_DIALOG' }
  | { type: 'CLOSE_PRODUCT_MODAL' }
  | { type: 'CLOSE_EMPLOYEE_MODAL' }
  | { type: 'CLOSE_MAINTENANCE_MODAL' };

const initialModalState: ModalState = {
  showCompanyDialog: false,
  showProductModal: false,
  showEmployeeModal: false,
  showMaintenanceModal: false,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_COMPANY_DIALOG':
      return { ...initialModalState, showCompanyDialog: true };
    case 'OPEN_PRODUCT_MODAL':
      return { ...initialModalState, showProductModal: true };
    case 'OPEN_EMPLOYEE_MODAL':
      return { ...initialModalState, showEmployeeModal: true };
    case 'OPEN_MAINTENANCE_MODAL':
      return { ...initialModalState, showMaintenanceModal: true };
    case 'CLOSE_COMPANY_DIALOG':
      return { ...state, showCompanyDialog: false };
    case 'CLOSE_PRODUCT_MODAL':
      return { ...state, showProductModal: false };
    case 'CLOSE_EMPLOYEE_MODAL':
      return { ...state, showEmployeeModal: false };
    case 'CLOSE_MAINTENANCE_MODAL':
      return { ...state, showMaintenanceModal: false };
    case 'CLOSE_ALL_MODALS':
      return initialModalState;
    default:
      return state;
  }
}

interface SidebarSubItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: 'modal' | 'link';
  modalType?: 'product' | 'employee' | 'maintenance';
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  subItems?: SidebarSubItem[];
}

interface SidebarProps {
  userRole: 'company' | 'employee';
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: User; // ✅ NUOVO: Utente autenticato da localStorage
}

const companySidebarItems: SidebarItem[] = [
  { id: "dashboard", href: "/company/dashboard", label: "Dashboard", icon: Home },
  { 
    id: "employees",
    label: "Dipendenti", 
    icon: Users,
    subItems: [
      { href: "/company/employee", label: "Lista Dipendenti", icon: List, action: 'link' },
      { label: "Aggiungi Dipendente", icon: Plus, action: 'modal', modalType: 'employee' },
    ]
  },
  { 
    id: "products",
    label: "Prodotti", 
    icon: Package,
    subItems: [
      { href: "/company/products", label: "Lista Prodotti", icon: List, action: 'link' },
      { label: "Aggiungi Prodotto", icon: Plus, action: 'modal', modalType: 'product' },
    ]
  },
  { 
    id: "maintenance",
    label: "Manutenzioni", 
    icon: Wrench,
    subItems: [
      { href: "/company/maintenance", label: "Lista Manutenzioni", icon: List, action: 'link' },
      { label: "Nuova Manutenzione", icon: Plus, action: 'modal', modalType: 'maintenance' },
    ]
  },
  { id: "map", href: "/company/map", label: "Mappa", icon: Map },
];

const employeeSidebarItems: SidebarItem[] = [
  { id: "dashboard", href: "/employee/dashboard", label: "Dashboard", icon: Home },
  { 
    id: "products",
    label: "Prodotti", 
    icon: Package,
    subItems: [
      { href: "/employee/products", label: "Lista Prodotti", icon: List, action: 'link' },
      { label: "Aggiungi Prodotto", icon: Plus, action: 'modal', modalType: 'product' },
    ]
  },
  { 
    id: "maintenance",
    label: "Manutenzioni", 
    icon: Wrench,
    subItems: [
      { href: "/employee/maintenance", label: "Lista Manutenzioni", icon: List, action: 'link' },
      { label: "Nuova Manutenzione", icon: Plus, action: 'modal', modalType: 'maintenance' },
    ]
  },
  { id: "map", href: "/employee/map", label: "Mappa", icon: Map },
];

export const Sidebar = memo(function Sidebar({ userRole, isOpen = false, onClose, currentUser }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch per il tema
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Memoize sidebar items selection
  const sidebarItems = useMemo(() => 
    userRole === 'company' ? companySidebarItems : employeeSidebarItems, 
    [userRole]
  );
  
  const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  const handleLinkClick = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleLogout = useCallback(() => {
    // Redirect to home page
    window.location.href = '/';
  }, []);

  const getRoleTitle = useMemo(() => {
    return userRole === 'company' ? 'Azienda' : 'Dipendente';
  }, [userRole]);

  const isItemActive = useCallback((item: SidebarItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => {
        if (!subItem.href) return false;
        // Match exact path or nested routes (e.g., /company/products and /company/products/[id])
        return pathname === subItem.href || pathname.startsWith(subItem.href + '/');
      });
    }
    return false;
  }, [pathname]);

  const isSubItemActive = useCallback((subItem: SidebarSubItem): boolean => {
    if (!subItem.href) return false;
    // Match exact path or nested routes (e.g., /company/products and /company/products/[id])
    return pathname === subItem.href || pathname.startsWith(subItem.href + '/');
  }, [pathname]);

  const handleSubItemClick = useCallback((subItem: SidebarSubItem) => {
    if (subItem.action === 'modal') {
      switch (subItem.modalType) {
        case 'product':
          dispatchModal({ type: 'OPEN_PRODUCT_MODAL' });
          break;
        case 'employee':
          dispatchModal({ type: 'OPEN_EMPLOYEE_MODAL' });
          break;
        case 'maintenance':
          dispatchModal({ type: 'OPEN_MAINTENANCE_MODAL' });
          break;
      }
      handleLinkClick(); // Close sidebar on mobile
    }
  }, [handleLinkClick]);

  const handleModalSubmit = useCallback(async (data: any, type: string) => {
    try {
      if (type === 'Product') {
        // Verifica che currentUser sia disponibile
        if (!currentUser) {
          console.error('❌ Cannot create product: currentUser is not available');
          if (typeof window !== 'undefined') {
            alert('❌ Errore: Utente non autenticato. Ricarica la pagina e riprova.');
          }
          return;
        }

        // Import the service dynamically to avoid circular dependencies
        const { createProductWithQR, transformFormDataToProduct } = await import('@/services/product-service');

        try {
          // Transform form data to API format usando currentUser REALE
          const productData = transformFormDataToProduct(data, currentUser);

          // Create product with QR code usando currentUser REALE
          const result = await createProductWithQR(productData, currentUser);

          if (result.success && result.data) {
            console.log('✅ Product created successfully:', {
              product: result.data.product,
              qr_code: result.data.product.qr_code,
              qr_image_base64: result.data.qr_image_base64.substring(0, 50) + '...', // Log first 50 chars
              qr_url: result.data.qr_url,
            });

            // Show success notification (in a real app, you'd use a toast/notification system)
            if (typeof window !== 'undefined') {
              // Simple browser alert for now
              alert(`✅ Prodotto creato con successo!\n\nQR Code: ${result.data.product.qr_code}\nTipo: ${result.data.product.tipologia_segnale}\nForma: ${result.data.product.forma}`);
            }

            // Dispatch custom event per triggare refresh in pagine che ascoltano
            window.dispatchEvent(new CustomEvent('product-created', {
              detail: result.data
            }));

            // TODO: Navigate to product detail page or show QR modal

          } else {
            throw new Error(result.error || 'Failed to create product');
          }

        } catch (productError) {
          console.error('❌ Product creation failed:', productError);

          if (typeof window !== 'undefined') {
            alert(`❌ Errore nella creazione del prodotto:\n${productError instanceof Error ? productError.message : 'Errore sconosciuto'}`);
          }
        }

      } else if (type === 'Employee') {
        console.log('👤 Employee creation not yet implemented:', data);
        // TODO: Implement employee creation

      } else if (type === 'Maintenance') {
        console.log('🔧 Creating maintenance record:', data);

        try {
          // Call maintenance API
          const response = await fetch('/api/maintenance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.message || result.error || 'Failed to create maintenance');
          }

          console.log('✅ Maintenance created successfully:', {
            id: result.data.id,
            product_uuid: result.data.product_uuid,
            intervention_type: result.data.intervention_type,
            asset_id: result.data.asset_id,
            metadata_cid: result.data.metadata_cid,
            transaction_id: result.data.transaction_id
          });

          // Success - toast already handled by modal
          // Dispatch custom event per triggare refresh in pagine che ascoltano
          window.dispatchEvent(new CustomEvent('maintenance-created', {
            detail: result.data
          }));

          // TODO: Navigate to maintenance detail page

        } catch (maintenanceError) {
          console.error('❌ Maintenance creation failed:', maintenanceError);
          throw maintenanceError; // Propaga errore al modal per toast errore
        }

      } else {
        console.warn('⚠️ Unknown modal type:', type, data);
      }

    } catch (error) {
      console.error(`❌ Modal submit error for ${type}:`, error);

      if (typeof window !== 'undefined') {
        alert(`❌ Errore nel salvataggio:\n${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      }
    }
  }, [currentUser]); // ✅ Aggiungiamo currentUser nella dependency array

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-0 lg:inset-y-0 left-0 z-60 lg:z-30 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile Header - Solo mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary">CP</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">Certificable Plus</h2>
              <p className="text-xs text-muted-foreground">{getRoleTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLinkClick}
            className="h-8 w-8"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <Accordion type="multiple" className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              
              // Simple link without subitems
              if (item.href && !item.subItems) {
                return (
                  <MemoizedSidebarLink
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    handleLinkClick={handleLinkClick}
                  />
                );
              }

              // Accordion item with subitems
              return (
                <AccordionItem key={item.id} value={item.id} className="border-0">
                  <AccordionTrigger
                    suppressHydrationWarning
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group hover:no-underline [&[data-state=open]>svg]:rotate-90",
                      isActive
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        !isActive && "group-hover:scale-110"
                      )}>
                        <Icon className="w-full h-full" />
                      </div>
                      {item.label}
                      {isActive && (
                        <span suppressHydrationWarning className="inline-block w-1.5 h-1.5 bg-sidebar-primary rounded-full ml-auto mr-2"></span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pt-2">
                    <div className="space-y-1 ml-4 border-l border-sidebar-border/50 pl-4">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = isSubItemActive(subItem);
                        
                        // Handle different action types
                        if (subItem.action === 'link' && subItem.href) {
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-200 group relative",
                                isSubActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm border-l-2 border-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground hover:border-l-2 hover:border-sidebar-primary/50 border-l-2 border-transparent"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 transition-all duration-200 flex-shrink-0",
                                isSubActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60",
                                !isSubActive && "group-hover:scale-110 group-hover:text-sidebar-primary"
                              )}>
                                <SubIcon className="w-full h-full" />
                              </div>
                              <span className="font-medium">{subItem.label}</span>
                              {isSubActive && (
                                <div className="w-1.5 h-1.5 bg-sidebar-primary-foreground rounded-full ml-auto flex-shrink-0"></div>
                              )}
                            </Link>
                          );
                        } else {
                          // Modal action button
                          return (
                            <button
                              key={subItem.label}
                              onClick={() => handleSubItemClick(subItem)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-200 group relative",
                                "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground hover:border-l-2 hover:border-sidebar-primary/50 border-l-2 border-transparent"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 transition-all duration-200 flex-shrink-0 text-sidebar-foreground/60",
                                "group-hover:scale-110 group-hover:text-sidebar-primary"
                              )}>
                                <SubIcon className="w-full h-full" />
                              </div>
                              <span className="font-medium">{subItem.label}</span>
                            </button>
                          );
                        }
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </nav>

        {/* Footer with Company Info and Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
                    
          {/* Theme Selector */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground px-3">Tema</div>
            {mounted && (
              <div className="flex bg-sidebar-accent/50 rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200",
                    theme === 'light'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="w-3 h-3" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200",
                    theme === 'dark'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="w-3 h-3" />
                  Dark
                </button>
              </div>
            )}
          </div>
          
          {/* Company Button */}
          <button
            onClick={() => dispatchModal({ type: 'OPEN_COMPANY_DIALOG' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="text-xs font-bold text-primary">CP</div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Certificable Plus</span>
              <span className="text-xs text-muted-foreground">{getRoleTitle}</span>
            </div>
          </button>


        </div>
      </div>

      {/* Company Dialog */}
      <Dialog open={modalState.showCompanyDialog} onOpenChange={(open) => dispatchModal({ type: open ? 'OPEN_COMPANY_DIALOG' : 'CLOSE_COMPANY_DIALOG' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="text-lg font-bold text-primary">CP</div>
              </div>
              Certificable Plus
            </DialogTitle>
            <DialogDescription>
              Gestione account e impostazioni azienda
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => {
                dispatchModal({ type: 'CLOSE_COMPANY_DIALOG' });
                // Navigate to profile
              }}
            >
              <UserIcon className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Profilo Utente</div>
                <div className="text-xs text-muted-foreground">Gestione account personale</div>
              </div>
            </Button>
            
            {userRole === 'company' && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => {
                  dispatchModal({ type: 'CLOSE_COMPANY_DIALOG' });
                  // Navigate to company settings
                }}
              >
                <Building2 className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Impostazioni Azienda</div>
                  <div className="text-xs text-muted-foreground">Configurazione generale</div>
                </div>
              </Button>
            )}
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => {
                dispatchModal({ type: 'CLOSE_COMPANY_DIALOG' });
                // Navigate to app settings
              }}
            >
              <Settings className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Impostazioni App</div>
                <div className="text-xs text-muted-foreground">Preferenze applicazione</div>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                dispatchModal({ type: 'CLOSE_COMPANY_DIALOG' });
                handleLogout();
              }}
            >
              <LogOut className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Esci</div>
                <div className="text-xs text-muted-foreground">Disconnetti dall'account</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      {modalState.showProductModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
          <ProductModal
            isOpen={modalState.showProductModal}
            onClose={() => dispatchModal({ type: 'CLOSE_PRODUCT_MODAL' })}
            onSubmit={(data) => handleModalSubmit(data, 'Product')}
            mode="add"
          />
        </Suspense>
      )}

      {/* Employee Modal */}
      {modalState.showEmployeeModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
          <EmployeeModal
            isOpen={modalState.showEmployeeModal}
            onClose={() => dispatchModal({ type: 'CLOSE_EMPLOYEE_MODAL' })}
            onSubmit={(data) => handleModalSubmit(data, 'Employee')}
            mode="add"
          />
        </Suspense>
      )}

      {/* Maintenance Modal */}
      {modalState.showMaintenanceModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
          <MaintenanceModal
            isOpen={modalState.showMaintenanceModal}
            onClose={() => dispatchModal({ type: 'CLOSE_MAINTENANCE_MODAL' })}
            onSubmit={(data) => handleModalSubmit(data, 'Maintenance')}
            mode="add"
          />
        </Suspense>
      )}
    </>
  );
});
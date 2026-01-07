/**
 * PageHeader Component - Header riutilizzabile per pagine company dashboard
 * 
 * Header responsive con gradiente per sezioni del dashboard aziendale.
 * Supporta sia utilizzo diretto con props che tramite context.
 * 
 * **Core Features:**
 * - Icon, title e description configurabili
 * - Tab switcher opzionale (es. Lista/Calendario)
 * - Action buttons personalizzabili
 * - Responsive design mobile-first
 * - Consistent styling con design system
 * - Context-aware rendering automatico
 * 
 * **Usage Modes:**
 * 1. **Direct Props**: `<PageHeader icon={...} title={...} />`
 * 2. **Context-based**: `<PageHeaderRenderer />` (auto-config dal context)
 * 
 * **Usage Examples:**
 * - Products page con cards/table toggle
 * - Maintenance page con lista/calendario toggle
 * - Employee page con solo action buttons
 * - Reports page senza tab né buttons
 */

"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { usePageHeaderContext } from "@/contexts/PageHeaderContext";

/**
 * Tab configuration per header switcher
 */
export interface HeaderTab {
  id: string;
  label: string;
  mobileLabel?: string; // Label abbreviata per mobile
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Action button configuration
 */
export interface HeaderButton {
  id: string;
  label: string;
  mobileLabel?: string; // Label abbreviata per mobile
  icon: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "sm" | "default" | "lg";
  onClick: () => void;
}

/**
 * Props per PageHeader component
 */
interface PageHeaderProps {
  // Contenuto principale
  icon: LucideIcon;
  title: string;
  description: string;
  
  // Tab switcher opzionale
  tabs?: HeaderTab[];
  
  // Action buttons opzionali
  buttons?: HeaderButton[];
  
  // Custom styling
  className?: string;
}

/**
 * PageHeader Component principale
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  tabs,
  buttons,
  className = ""
}: PageHeaderProps) {
  
  return (
    <div className={`bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Left side: Icon, Title, Description */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl sm:text-3xl lg:text-4xl">{title}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
              {description}
            </p>
          </div>

          {/* Right side: Tabs e Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            
            {/* Tab switcher se presente */}
            {tabs && tabs.length > 0 && (
              <div className="flex items-center bg-muted/50 rounded-lg p-1 flex-1 sm:flex-none">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={tab.isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={tab.onClick}
                    className="h-8 flex-1 sm:flex-none"
                  >
                    <tab.icon className="h-4 w-4 mr-1" />
                    {/* Desktop label */}
                    <span className="hidden sm:inline">{tab.label}</span>
                    {/* Mobile label se diversa, altrimenti usa label normale */}
                    <span className="sm:hidden">
                      {tab.mobileLabel || tab.label}
                    </span>
                  </Button>
                ))}
              </div>
            )}
            
            {/* Action buttons se presenti */}
            {buttons && buttons.length > 0 && (
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                {buttons.map((button) => (
                  <Button
                    key={button.id}
                    variant={button.variant || 'default'}
                    size={button.size || 'default'}
                    onClick={button.onClick}
                    className="flex-1 sm:flex-none sm:w-auto"
                  >
                    <button.icon className="h-4 w-4 mr-2" />
                    {/* Desktop label */}
                    <span className="hidden sm:inline">
                      {button.mobileLabel ? button.label : button.label}
                    </span>
                    {/* Mobile label se diversa */}
                    <span className="sm:hidden">
                      {button.mobileLabel || button.label}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PageHeaderRenderer - Componente che renderizza header dal context
 * 
 * Versione automatica che legge la configurazione dal PageHeaderContext
 * e renderizza il PageHeader con i dati forniti dal context.
 */
export function PageHeaderRenderer() {
  const context = usePageHeaderContext();
  
  if (!context?.config) {
    return null;
  }

  const { icon, title, description, tabs, buttons } = context.config;

  return (
    <PageHeader
      icon={icon}
      title={title}
      description={description}
      tabs={tabs}
      buttons={buttons}
    />
  );
}

/**
 * Hook helper per creare tab configurations
 */
export function useHeaderTabs(
  activeTab: string,
  onTabChange: (tabId: string) => void
) {
  return useCallback((tabConfigs: Omit<HeaderTab, 'isActive' | 'onClick'>[]) => {
    return tabConfigs.map(config => ({
      ...config,
      isActive: config.id === activeTab,
      onClick: () => onTabChange(config.id)
    }));
  }, [activeTab, onTabChange]);
}

/**
 * Hook helper per creare button configurations
 */
export function useHeaderButtons(
  handlers: Record<string, () => void>
) {
  return useCallback((buttonConfigs: Omit<HeaderButton, 'onClick'>[]) => {
    return buttonConfigs.map(config => ({
      ...config,
      onClick: handlers[config.id] || (() => console.warn(`No handler for button: ${config.id}`))
    }));
  }, [handlers]);
}

export default PageHeader;
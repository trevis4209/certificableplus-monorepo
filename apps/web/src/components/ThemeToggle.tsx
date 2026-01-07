"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const ThemeToggle = React.memo(function ThemeToggle() {
  const { setTheme } = useTheme()

  const handleLightTheme = React.useCallback(() => setTheme("light"), [setTheme])
  const handleDarkTheme = React.useCallback(() => setTheme("dark"), [setTheme])
  const handleSystemTheme = React.useCallback(() => setTheme("system"), [setTheme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambia tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLightTheme}>
          Chiaro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDarkTheme}>
          Scuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSystemTheme}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
});
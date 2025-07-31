"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon, Waves, Sunset, Trees, Zap } from "lucide-react";
import { useTheme, themes } from "@/components/theme-provider";

const themeIcons = {
  light: { icon: Sun },
  dark: { icon: Moon },
  ocean: { icon: Waves },
  sunset: { icon: Sunset },
  forest: { icon: Trees },
  cyberpunk: { icon: Zap },
};

export function ThemeSwitcher() {
  const { currentTheme, changeTheme } = useTheme();

  const currentThemeIcon = themeIcons[currentTheme as keyof typeof themeIcons]?.icon || Palette;
  const currentThemeLabel = themes.find(t => t.name === currentTheme)?.label || "Theme";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {React.createElement(currentThemeIcon, { className: "h-4 w-4" })}
          {currentThemeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => {
          const IconComponent = themeIcons[theme.name as keyof typeof themeIcons]?.icon || Palette;
          return (
            <DropdownMenuItem
              key={theme.name}
              onClick={() => changeTheme(theme.name)}
              className="gap-2"
            >
              {React.createElement(IconComponent, { className: "h-4 w-4" })}
              {theme.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
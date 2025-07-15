"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon, Waves, Sunset, Trees, Zap } from "lucide-react";

type Theme = "light" | "dark" | "ocean" | "sunset" | "forest" | "cyberpunk";

const themes = [
  { name: "light", label: "Light", icon: Sun },
  { name: "dark", label: "Dark", icon: Moon },
  { name: "ocean", label: "Ocean", icon: Waves },
  { name: "sunset", label: "Sunset", icon: Sunset },
  { name: "forest", label: "Forest", icon: Trees },
  { name: "cyberpunk", label: "Cyberpunk", icon: Zap },
] as const;

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    document.documentElement.className = theme === "light" ? "" : theme;
    localStorage.setItem("theme", theme);
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const currentThemeData = themes.find(t => t.name === currentTheme);
  const CurrentIcon = currentThemeData?.icon || Palette;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          {currentThemeData?.label || "Theme"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ name, label, icon: Icon }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => handleThemeChange(name)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
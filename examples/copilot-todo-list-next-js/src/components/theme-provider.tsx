"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

export type Theme = "light" | "dark" | "ocean" | "sunset" | "forest" | "cyberpunk";

export const themes = [
    { name: "light", label: "Light" },
    { name: "dark", label: "Dark" },
    { name: "ocean", label: "Ocean" },
    { name: "sunset", label: "Sunset" },
    { name: "forest", label: "Forest" },
    { name: "cyberpunk", label: "Cyberpunk" },
] as const;

interface ThemeContextType {
    currentTheme: Theme;
    changeTheme: (theme: Theme) => void;
    applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<Theme>("light");

    const applyTheme = useCallback((theme: Theme) => {
        document.documentElement.className = theme === "light" ? "" : theme;
        localStorage.setItem("theme", theme);
    }, []);

    const changeTheme = useCallback((theme: Theme) => {
        setCurrentTheme(theme);
        applyTheme(theme);
    }, [applyTheme]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme && themes.find(t => t.name === savedTheme)) {
            setCurrentTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, [applyTheme]);

    return (
        <ThemeContext.Provider value={{ currentTheme, changeTheme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
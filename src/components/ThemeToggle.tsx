import React from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage, type Lang } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  return (
    <div className={cn("flex items-center gap-1 bg-card border-1.5 border-border rounded-lg p-0.5", className)}>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title={theme === "dark" ? t("light") : t("dark")}
      >
        {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={() => setLang(lang === "en" ? "zh" : "en")}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{lang === "en" ? "中" : "EN"}</span>
      </button>
    </div>
  );
};

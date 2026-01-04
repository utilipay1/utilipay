import { useState } from 'react';
import { View } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription
} from "@/components/ui/sheet";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { label: string; value: View }[] = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Properties', value: 'properties' },
    { label: 'Bills', value: 'bills' },
  ];

  const handleNavClick = (view: View) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => handleNavClick('dashboard')}
            >
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                UtiliPay
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 bg-muted/50 p-1 rounded-xl border border-muted-foreground/5">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onViewChange(item.value)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold transition-all duration-200 rounded-lg cursor-pointer",
                    currentView === item.value
                      ? "bg-background text-primary shadow-sm ring-1 ring-black/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0">
                <SheetHeader className="px-1 text-left">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Mobile navigation menu
                  </SheetDescription>
                  <div className="flex items-center gap-2 py-4">
                    <span className="font-black text-2xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      UtiliPay
                    </span>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-4 pr-6">
                  {navItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleNavClick(item.value)}
                      className={cn(
                        "flex items-center px-4 py-3 text-base font-medium transition-all rounded-lg text-left",
                        currentView === item.value
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
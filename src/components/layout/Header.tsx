import { useState } from 'react';
import { View } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
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
    { label: 'Notes', value: 'notes' },
  ];

  const handleNavClick = (view: View) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8 pl-1">
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => handleNavClick('dashboard')}
            >
              <span className="font-black text-xl lg:text-2xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                Utility Bill Manager
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex text-muted-foreground hover:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0 border-r bg-background flex flex-col">
                <SheetHeader className="px-6 text-left border-b h-16 flex shrink-0 justify-center">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Mobile navigation menu
                  </SheetDescription>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Utility Bill Manager
                    </span>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6 px-4 flex-1">
                  {navItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleNavClick(item.value)}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium transition-all rounded-md text-left relative overflow-hidden group",
                        currentView === item.value
                          ? "bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {currentView === item.value && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="p-4 border-t mt-auto">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-destructive gap-3 px-4"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
import { View } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const navItems: { label: string; value: View }[] = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Properties', value: 'properties' },
    { label: 'Bills', value: 'bills' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => onViewChange('dashboard')}
            >
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                UtiliPay
              </span>
            </div>
            
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
            {/* Action icons or Profile could go here */}
          </div>
        </div>
      </div>
    </header>
  );
}
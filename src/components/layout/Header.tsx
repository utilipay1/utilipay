import { View } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center mr-8">
          <span className="font-bold text-xl tracking-tight">
            UtiliPay
          </span>
        </div>
        <div className="flex items-center space-x-2">
           <Button 
             variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
             onClick={() => onViewChange('dashboard')}
             aria-current={currentView === 'dashboard' ? 'page' : undefined}
           >
             Dashboard
           </Button>
           
           <Button 
             variant={currentView === 'properties' ? 'secondary' : 'ghost'}
             onClick={() => onViewChange('properties')}
             aria-current={currentView === 'properties' ? 'page' : undefined}
           >
             Properties
           </Button>

           <Button 
             variant={currentView === 'bills' ? 'secondary' : 'ghost'}
             onClick={() => onViewChange('bills')}
             aria-current={currentView === 'bills' ? 'page' : undefined}
           >
             Bills
           </Button>
        </div>
      </div>
    </nav>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Mountain, Map, PlusCircle, GitCompare, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import RatingModeToggle from '@/components/RatingModeToggle';

export default function Layout({ children, currentPageName }) {
  const { user } = useAuth();
  const isAdminPage = currentPageName === 'Admin';

  const navItems = [
    { name: 'Home', icon: Mountain, page: 'Home' },
    { name: 'Resorts', icon: Map, page: 'Resorts' },
    { name: 'Add', icon: PlusCircle, page: 'AddData' },
    { name: 'Compare', icon: GitCompare, page: 'Compare' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', icon: ShieldCheck, page: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        :root {
          --ice-blue: #0EA5E9;
          --ice-light: #E0F2FE;
          --slate-900: #0F172A;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className={`mx-auto w-full px-4 py-2.5 ${isAdminPage ? 'max-w-[1400px] lg:px-8' : 'max-w-lg'}`}>
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 shrink-0 min-w-0">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">vrtIQ</div>
                <div className="hidden sm:inline-flex items-center gap-1 mt-1 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-slate-400 font-medium">
                  Real Difficulty
                </div>
              </div>
            </Link>

            <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
              <RatingModeToggle className="justify-end" />
              {user?.role === 'admin' && (
                <Link
                  to={createPageUrl('Admin')}
                  className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 rounded-full px-3 py-2 border border-transparent hover:border-slate-200 hover:bg-slate-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
              {!user && (
                <Link to={createPageUrl('Login')}>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-full">
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full ${isAdminPage ? 'mx-auto max-w-[1400px]' : 'max-w-lg mx-auto'}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={`sticky bottom-0 bg-white border-t border-slate-100 safe-area-inset-bottom ${isAdminPage ? 'lg:hidden' : ''}`}>
        <div className={`mx-auto px-2 ${isAdminPage ? 'w-full max-w-[1400px] lg:px-8' : 'max-w-lg'}`}>
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive 
                      ? 'text-sky-500' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-[10px] font-medium tracking-wide ${
                    isActive ? 'text-sky-500' : ''
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
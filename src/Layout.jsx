import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Mountain, Map, PlusCircle, GitCompare } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Home', icon: Mountain, page: 'Home' },
    { name: 'Resorts', icon: Map, page: 'Resorts' },
    { name: 'Add', icon: PlusCircle, page: 'AddData' },
    { name: 'Compare', icon: GitCompare, page: 'Compare' },
  ];

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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-lg">Whiteout</span>
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            Real Difficulty
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t border-slate-100 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto px-2">
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
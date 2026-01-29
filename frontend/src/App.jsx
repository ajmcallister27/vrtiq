import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Mountain, Map, PlusCircle, GitCompare, Settings } from 'lucide-react';
import Home from './pages/Home';
import Resorts from './pages/Resorts';
import Resort from './pages/Resort';
import RunDetail from './pages/RunDetail';
import AddData from './pages/AddData';
import Compare from './pages/Compare';
import SettingsPage from './pages/Settings';

const navItems = [
  { path: '/', icon: Mountain, label: 'Home' },
  { path: '/resorts', icon: Map, label: 'Resorts' },
  { path: '/add', icon: PlusCircle, label: 'Add' },
  { path: '/compare', icon: GitCompare, label: 'Compare' }
];

export default function App() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-lg">Whiteout</span>
          </Link>
          <Link to="/settings" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resorts" element={<Resorts />} />
          <Route path="/resort/:id" element={<Resort />} />
          <Route path="/run/:id" element={<RunDetail />} />
          <Route path="/add" element={<AddData />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <nav className="sticky bottom-0 bg-white border-t border-slate-100">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-sky-500' : ''}`}>
                    {label}
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

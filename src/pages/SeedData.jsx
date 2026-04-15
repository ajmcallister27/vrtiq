import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { RESORT_CATALOG } from '../components/resortCatalog';
import { RUN_CATALOG } from '../components/runCatalog';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Database, Mountain, Map } from 'lucide-react';

export default function SeedData() {
  const [status, setStatus] = useState('idle'); // idle | seeding | done | error
  const [log, setLog] = useState([]);

  const { data: existingResorts = [] } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => api.entities.Resort.list('-created_date', 200),
  });

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const seedAll = async () => {
    setStatus('seeding');
    setLog([]);

    try {
      // Step 1: Seed resorts
      addLog('Seeding resorts...');
      const existingNames = new Set(existingResorts.map(r => r.name.toLowerCase()));
      const resortsToAdd = RESORT_CATALOG.filter(r => !existingNames.has(r.name.toLowerCase()));

      addLog(`Found ${existingResorts.length} existing resorts. Adding ${resortsToAdd.length} new ones...`);

      const createdResortMap = {}; // name -> id

      // Add existing resorts to map
      existingResorts.forEach(r => { createdResortMap[r.name.toLowerCase()] = r.id; });

      // Create new resorts in batches
      for (let i = 0; i < resortsToAdd.length; i += 10) {
        const batch = resortsToAdd.slice(i, i + 10);
        const results = await Promise.all(
          batch.map(r => api.entities.Resort.create({
            name: r.name,
            location: r.location,
            country: r.country,
            latitude: r.latitude,
            longitude: r.longitude,
            vertical_drop: r.vertical_drop,
            base_elevation: r.base_elevation,
            peak_elevation: r.peak_elevation,
            website: r.website,
          }))
        );
        results.forEach((res, idx) => {
          createdResortMap[batch[idx].name.toLowerCase()] = res.id;
        });
        addLog(`  Added resorts ${i + 1}–${Math.min(i + 10, resortsToAdd.length)}`);
      }

      addLog(`✓ Resorts done. Total: ${Object.keys(createdResortMap).length}`);

      // Step 2: Seed runs
      addLog('Seeding runs...');
      const existingRuns = await api.entities.Run.list('-created_date', 500);
      const existingRunKeys = new Set(existingRuns.map(r => `${r.resort_id}::${r.name.toLowerCase()}`));

      let runsAdded = 0;
      let runsSkipped = 0;

      for (let i = 0; i < RUN_CATALOG.length; i += 10) {
        const batch = RUN_CATALOG.slice(i, i + 10);
        await Promise.all(
          batch.map(async (run) => {
            const resortId = createdResortMap[run.resort_name.toLowerCase()];
            if (!resortId) { runsSkipped++; return; }
            const key = `${resortId}::${run.name.toLowerCase()}`;
            if (existingRunKeys.has(key)) { runsSkipped++; return; }
            await api.entities.Run.create({
              name: run.name,
              resort_id: resortId,
              official_difficulty: run.official_difficulty,
              lift: run.lift,
              vertical_drop: run.vertical_drop,
              length_ft: run.length_ft,
              average_pitch: run.average_pitch,
              max_pitch: run.max_pitch,
              groomed: run.groomed,
              description: run.description,
            });
            runsAdded++;
          })
        );
      }

      addLog(`✓ Runs done. Added: ${runsAdded}, Skipped (already exist): ${runsSkipped}`);
      addLog('🎉 All done!');
      setStatus('done');
    } catch (err) {
      addLog(`Error: ${err.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Database className="w-6 h-6 text-sky-500" />
        <h1 className="text-xl font-bold text-slate-900">Seed Database</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Populate the database with all Epic, Ikon, and Boyne resorts plus known runs. Safe to run multiple times — duplicates are skipped.
      </p>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{RESORT_CATALOG.length} resorts</span>
        </div>
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{RUN_CATALOG.length} runs</span>
        </div>
      </div>

      <Button
        onClick={seedAll}
        disabled={status === 'seeding'}
        className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11 mb-4"
      >
        {status === 'seeding' ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Seeding...</>
        ) : status === 'done' ? (
          <><Check className="w-4 h-4 mr-2" /> Done!</>
        ) : (
          'Seed All Data'
        )}
      </Button>

      {log.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1 max-h-64 overflow-y-auto">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  );
}
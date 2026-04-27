import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mountain, Map, Loader2, Check, ChevronRight, 
  Plus, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DifficultyBadge from '../components/DifficultyBadge';

export default function AddData() {
  const [searchParams] = useSearchParams();
  const preselectedResortId = searchParams.get('resort');
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(preselectedResortId ? 'run' : 'resort');
  // Resort form
  const [resortForm, setResortForm] = useState({
    name: '',
    location: '',
    country: '',
    latitude: '',
    longitude: '',
    website: '',
    vertical_drop: '',
    base_elevation: '',
    peak_elevation: '',
    map_image_url: ''
  });

  // Run form
  const [runForm, setRunForm] = useState({
    name: '',
    resort_id: preselectedResortId || '',
    official_difficulty: 'blue',
    lift: '',
    lift_id: '',
    length_ft: '',
    vertical_drop: '',
    average_pitch: '',
    max_pitch: '',
    groomed: true,
    description: ''
  });
  const [liftForm, setLiftForm] = useState({
    resort_id: preselectedResortId || '',
    name: '',
    lift_type: 'chairlift',
    seat_count: '',
    vertical_rise_ft: '',
    ride_minutes_avg: ''
  });
  const [importUrl, setImportUrl] = useState('');
  const [importResult, setImportResult] = useState(null);

  const { data: resorts = [] } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => api.entities.Resort.list()
  });

  const { data: lifts = [] } = useQuery({
    queryKey: ['lifts', runForm.resort_id],
    queryFn: () => api.entities.Lift.filter({ resort_id: runForm.resort_id }, 'name'),
    enabled: !!runForm.resort_id
  });

  // Mutations
  const resortMutation = useMutation({
    mutationFn: (data) => api.entities.Resort.create(data),
    onSuccess: (newResort) => {
      queryClient.invalidateQueries(['resorts']);
      setResortForm({
        name: '', location: '', country: '', latitude: '', longitude: '',
        website: '', vertical_drop: '', base_elevation: '', peak_elevation: '', map_image_url: ''
      });
      // Switch to run tab and preselect the new resort
      setRunForm(prev => ({ ...prev, resort_id: newResort.id }));
      setActiveTab('run');
    }
  });

  const runMutation = useMutation({
    mutationFn: (data) => api.entities.Run.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['runs']);
      const resortId = runForm.resort_id;
      setRunForm({
        name: '', resort_id: resortId, official_difficulty: 'blue', lift: '', lift_id: '',
        length_ft: '', vertical_drop: '', average_pitch: '', max_pitch: '',
        groomed: true, description: ''
      });
    }
  });

  const liftMutation = useMutation({
    mutationFn: (data) => api.entities.Lift.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lifts']);
      queryClient.invalidateQueries(['lifts', runForm.resort_id]);
      queryClient.invalidateQueries(['lifts', liftForm.resort_id]);
    }
  });

  const bulkImportMutation = useMutation({
    mutationFn: (url) => api.integrations.importSkiresort({ url }),
    onSuccess: (result) => {
      setImportResult(result);
      const resortId = result?.resort?.id;
      if (resortId) {
        setRunForm((prev) => ({ ...prev, resort_id: resortId }));
        setLiftForm((prev) => ({ ...prev, resort_id: resortId }));
      }
      queryClient.invalidateQueries(['resorts']);
      queryClient.invalidateQueries(['lifts']);
      queryClient.invalidateQueries(['runs']);
    }
  });

  const handleResortSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...resortForm,
      latitude: resortForm.latitude ? parseFloat(resortForm.latitude) : undefined,
      longitude: resortForm.longitude ? parseFloat(resortForm.longitude) : undefined,
      vertical_drop: resortForm.vertical_drop ? parseInt(resortForm.vertical_drop) : undefined,
      base_elevation: resortForm.base_elevation ? parseInt(resortForm.base_elevation) : undefined,
      peak_elevation: resortForm.peak_elevation ? parseInt(resortForm.peak_elevation) : undefined,
    };
    // Remove empty strings
    Object.keys(data).forEach(key => data[key] === '' && delete data[key]);
    resortMutation.mutate(data);
  };

  const handleRunSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...runForm,
      length_ft: runForm.length_ft ? parseInt(runForm.length_ft) : undefined,
      vertical_drop: runForm.vertical_drop ? parseInt(runForm.vertical_drop) : undefined,
      average_pitch: runForm.average_pitch ? parseFloat(runForm.average_pitch) : undefined,
      max_pitch: runForm.max_pitch ? parseFloat(runForm.max_pitch) : undefined,
    };
    Object.keys(data).forEach(key => data[key] === '' && delete data[key]);
    runMutation.mutate(data);
  };

  const handleCreateLiftFromForm = (e) => {
    e.preventDefault();
    if (!liftForm.resort_id || !liftForm.name.trim()) {
      return;
    }

    liftMutation.mutate({
      resort_id: liftForm.resort_id,
      name: liftForm.name.trim(),
      lift_type: liftForm.lift_type,
      type: liftForm.lift_type,
      seat_count: liftForm.seat_count ? parseInt(liftForm.seat_count, 10) : undefined,
      vertical_rise_ft: liftForm.vertical_rise_ft ? parseInt(liftForm.vertical_rise_ft, 10) : undefined,
      ride_minutes_avg: liftForm.ride_minutes_avg ? parseFloat(liftForm.ride_minutes_avg) : undefined
    }, {
      onSuccess: (createdLift) => {
        setLiftForm((prev) => ({
          ...prev,
          name: '',
          lift_type: 'chairlift',
          seat_count: '',
          vertical_rise_ft: '',
          ride_minutes_avg: ''
        }));
        setRunForm((prev) => ({
          ...prev,
          resort_id: createdLift.resort_id,
          lift_id: createdLift.id,
          lift: createdLift.name
        }));
        setActiveTab('run');
      }
    });
  };

  const handleBulkImportSubmit = (e) => {
    e.preventDefault();
    if (!importUrl.trim()) {
      return;
    }

    setImportResult(null);
    bulkImportMutation.mutate(importUrl.trim());
  };

  const selectedResort = resorts.find(r => r.id === runForm.resort_id);

  return (
    <div className="pb-8">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Add Data</h1>
        <p className="text-sm text-slate-500">Help build the community database</p>
      </div>

      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-slate-100 rounded-xl p-1">
            <TabsTrigger value="resort" className="flex-1 rounded-lg">
              <Mountain className="w-4 h-4 mr-2" />
              Resort
            </TabsTrigger>
            <TabsTrigger value="run" className="flex-1 rounded-lg">
              <Map className="w-4 h-4 mr-2" />
              Run
            </TabsTrigger>
            <TabsTrigger value="lift" className="flex-1 rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Lift
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex-1 rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              Bulk
            </TabsTrigger>
          </TabsList>

          {/* Bulk Import */}
          <TabsContent value="bulk" className="mt-4">
            <Card className="p-4 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Import From skiresort.info</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Paste a skiresort.info resort URL to auto-import resort info, lifts, and runs.
                </p>
              </div>

              <form onSubmit={handleBulkImportSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="import-url">skiresort.info URL *</Label>
                  <Input
                    id="import-url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://www.skiresort.info/ski-resort/..."
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={bulkImportMutation.isPending || !importUrl.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11"
                >
                  {bulkImportMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing Data...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Import Resort, Lifts, and Runs
                    </>
                  )}
                </Button>
              </form>

              {bulkImportMutation.isError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {bulkImportMutation.error?.message || 'Import failed.'}
                </div>
              )}

              {importResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                  <p className="text-sm font-medium text-emerald-800">
                    Imported {importResult.resort?.name || 'resort'} successfully.
                  </p>
                  <p className="text-xs text-emerald-700">
                    Scraped: {importResult.scraped?.lifts || 0} lifts, {importResult.scraped?.runs || 0} runs, {importResult.scraped?.map_assets_analyzed || 0} map assets analyzed.
                  </p>
                  <p className="text-xs text-emerald-700">
                    Database: {importResult.database?.liftsCreated || 0} lifts created, {importResult.database?.liftsUpdated || 0} lifts updated, {importResult.database?.runsCreated || 0} runs created, {importResult.database?.runsUpdated || 0} runs updated.
                  </p>
                  {Array.isArray(importResult.warnings) && importResult.warnings.length > 0 && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-2">
                      <p className="text-xs font-medium text-amber-700 mb-1">Warnings</p>
                      {importResult.warnings.map((warning) => (
                        <p key={warning} className="text-xs text-amber-700">• {warning}</p>
                      ))}
                    </div>
                  )}
                  {importResult.resort?.id && (
                    <Link to={createPageUrl(`Resort?id=${importResult.resort.id}`)} className="block">
                      <Button variant="outline" className="w-full rounded-xl">
                        View Imported Resort
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Add Resort */}
          <TabsContent value="resort" className="mt-4">
            <Card className="p-4">
              <form onSubmit={handleResortSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="resort-name">Resort Name *</Label>
                  <Input
                    id="resort-name"
                    value={resortForm.name}
                    onChange={(e) => setResortForm({ ...resortForm, name: e.target.value })}
                    placeholder="e.g. Vail"
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={resortForm.location}
                      onChange={(e) => setResortForm({ ...resortForm, location: e.target.value })}
                      placeholder="e.g. Vail, CO"
                      className="mt-1 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={resortForm.country}
                      onChange={(e) => setResortForm({ ...resortForm, country: e.target.value })}
                      placeholder="e.g. USA"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={resortForm.latitude}
                      onChange={(e) => setResortForm({ ...resortForm, latitude: e.target.value })}
                      placeholder="39.6403"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={resortForm.longitude}
                      onChange={(e) => setResortForm({ ...resortForm, longitude: e.target.value })}
                      placeholder="-106.3742"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="vertical">Vertical (ft)</Label>
                    <Input
                      id="vertical"
                      type="number"
                      value={resortForm.vertical_drop}
                      onChange={(e) => setResortForm({ ...resortForm, vertical_drop: e.target.value })}
                      placeholder="3450"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="base">Base (ft)</Label>
                    <Input
                      id="base"
                      type="number"
                      value={resortForm.base_elevation}
                      onChange={(e) => setResortForm({ ...resortForm, base_elevation: e.target.value })}
                      placeholder="8120"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="peak">Peak (ft)</Label>
                    <Input
                      id="peak"
                      type="number"
                      value={resortForm.peak_elevation}
                      onChange={(e) => setResortForm({ ...resortForm, peak_elevation: e.target.value })}
                      placeholder="11570"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={resortForm.website}
                    onChange={(e) => setResortForm({ ...resortForm, website: e.target.value })}
                    placeholder="https://www.vail.com"
                    className="mt-1 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="map_url">Trail Map Image URL</Label>
                  <Input
                    id="map_url"
                    type="url"
                    value={resortForm.map_image_url}
                    onChange={(e) => setResortForm({ ...resortForm, map_image_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 rounded-lg"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={resortMutation.isPending || !resortForm.name || !resortForm.location}
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11"
                >
                  {resortMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : resortMutation.isSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Resort Added!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Resort
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Add Run */}
          <TabsContent value="run" className="mt-4">
            <Card className="p-4">
              <form onSubmit={handleRunSubmit} className="space-y-4">
                <div>
                  <Label>Resort *</Label>
                  <Select 
                    value={runForm.resort_id} 
                    onValueChange={(val) => setRunForm({ ...runForm, resort_id: val, lift_id: '', lift: '' })}
                  >
                    <SelectTrigger className="mt-1 rounded-lg">
                      <SelectValue placeholder="Select a resort" />
                    </SelectTrigger>
                    <SelectContent>
                      {resorts.map(resort => (
                        <SelectItem key={resort.id} value={resort.id}>
                          {resort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {resorts.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No resorts yet. Add a resort first.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="run-name">Run Name *</Label>
                  <Input
                    id="run-name"
                    value={runForm.name}
                    onChange={(e) => setRunForm({ ...runForm, name: e.target.value })}
                    placeholder="e.g. Riva Ridge"
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label>Official Difficulty *</Label>
                  <div className="flex gap-2 mt-2">
                    {['green', 'blue', 'black', 'double_black'].map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setRunForm({ ...runForm, official_difficulty: diff })}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          runForm.official_difficulty === diff
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <DifficultyBadge difficulty={diff} size="md" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Lift</Label>
                  <Select
                    value={runForm.lift_id || '__none__'}
                    onValueChange={(val) => {
                      if (val === '__none__') {
                        setRunForm((prev) => ({ ...prev, lift_id: '', lift: '' }));
                        return;
                      }
                      const selected = lifts.find((lift) => lift.id === val);
                      setRunForm((prev) => ({ ...prev, lift_id: val, lift: selected?.name || '' }));
                    }}
                    disabled={!runForm.resort_id || lifts.length === 0}
                  >
                    <SelectTrigger className="mt-1 rounded-lg">
                      <SelectValue placeholder={runForm.resort_id ? 'Select lift' : 'Select a resort first'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No lift selected</SelectItem>
                      {lifts.map((lift) => (
                        <SelectItem key={lift.id} value={lift.id}>
                          {lift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="run-vertical">Vertical Drop (ft)</Label>
                    <Input
                      id="run-vertical"
                      type="number"
                      value={runForm.vertical_drop}
                      onChange={(e) => setRunForm({ ...runForm, vertical_drop: e.target.value })}
                      placeholder="1200"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">Length (ft)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={runForm.length_ft}
                      onChange={(e) => setRunForm({ ...runForm, length_ft: e.target.value })}
                      placeholder="5280"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="avg-pitch">Avg Pitch (°)</Label>
                    <Input
                      id="avg-pitch"
                      type="number"
                      step="0.1"
                      value={runForm.average_pitch}
                      onChange={(e) => setRunForm({ ...runForm, average_pitch: e.target.value })}
                      placeholder="22"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-pitch">Max Pitch (°)</Label>
                    <Input
                      id="max-pitch"
                      type="number"
                      step="0.1"
                      value={runForm.max_pitch}
                      onChange={(e) => setRunForm({ ...runForm, max_pitch: e.target.value })}
                      placeholder="35"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="groomed" className="cursor-pointer">Typically Groomed</Label>
                  <Switch
                    id="groomed"
                    checked={runForm.groomed}
                    onCheckedChange={(checked) => setRunForm({ ...runForm, groomed: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={runForm.description}
                    onChange={(e) => setRunForm({ ...runForm, description: e.target.value })}
                    placeholder="Brief description of the run..."
                    className="mt-1 rounded-lg"
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={runMutation.isPending || !runForm.name || !runForm.resort_id}
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11"
                >
                  {runMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : runMutation.isSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Run Added!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Run
                    </>
                  )}
                </Button>

                {runMutation.isSuccess && selectedResort && (
                  <Link 
                    to={createPageUrl(`Resort?id=${selectedResort.id}`)}
                    className="block"
                  >
                    <Button variant="outline" className="w-full rounded-xl">
                      View {selectedResort.name}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </form>
            </Card>
          </TabsContent>

          {/* Add Lift */}
          <TabsContent value="lift" className="mt-4">
            <Card className="p-4">
              <form onSubmit={handleCreateLiftFromForm} className="space-y-4">
                <div>
                  <Label>Resort *</Label>
                  <Select
                    value={liftForm.resort_id}
                    onValueChange={(val) => setLiftForm((prev) => ({ ...prev, resort_id: val }))}
                  >
                    <SelectTrigger className="mt-1 rounded-lg">
                      <SelectValue placeholder="Select a resort" />
                    </SelectTrigger>
                    <SelectContent>
                      {resorts.map((resort) => (
                        <SelectItem key={resort.id} value={resort.id}>{resort.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lift-name">Lift Name *</Label>
                  <Input
                    id="lift-name"
                    value={liftForm.name}
                    onChange={(e) => setLiftForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Gondola One"
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label>Lift Type</Label>
                  <Select
                    value={liftForm.lift_type}
                    onValueChange={(val) => setLiftForm((prev) => ({ ...prev, lift_type: val }))}
                  >
                    <SelectTrigger className="mt-1 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chairlift">Chairlift</SelectItem>
                      <SelectItem value="gondola">Gondola</SelectItem>
                      <SelectItem value="tram">Tram</SelectItem>
                      <SelectItem value="magic_carpet">Magic Carpet</SelectItem>
                      <SelectItem value="t_bar">T-Bar</SelectItem>
                      <SelectItem value="rope_tow">Rope Tow</SelectItem>
                      <SelectItem value="funicular">Funicular</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="lift-seat-count">Seats</Label>
                    <Input
                      id="lift-seat-count"
                      type="number"
                      min="1"
                      max="12"
                      value={liftForm.seat_count}
                      onChange={(e) => setLiftForm((prev) => ({ ...prev, seat_count: e.target.value }))}
                      placeholder="4"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lift-vertical">Lift Vert (ft)</Label>
                    <Input
                      id="lift-vertical"
                      type="number"
                      min="0"
                      value={liftForm.vertical_rise_ft}
                      onChange={(e) => setLiftForm((prev) => ({ ...prev, vertical_rise_ft: e.target.value }))}
                      placeholder="1200"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lift-ride-minutes">Ride Length (min)</Label>
                    <Input
                      id="lift-ride-minutes"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={liftForm.ride_minutes_avg}
                      onChange={(e) => setLiftForm((prev) => ({ ...prev, ride_minutes_avg: e.target.value }))}
                      placeholder="7.5"
                      className="mt-1 rounded-lg"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={liftMutation.isPending || !liftForm.resort_id || !liftForm.name.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11"
                >
                  {liftMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lift
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
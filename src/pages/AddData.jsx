import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mountain, Map, Loader2, Check, ChevronRight, 
  Plus
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
    length_ft: '',
    vertical_drop: '',
    average_pitch: '',
    max_pitch: '',
    groomed: true,
    description: ''
  });

  const { data: resorts = [] } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => api.entities.Resort.list()
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
        name: '', resort_id: resortId, official_difficulty: 'blue', lift: '',
        length_ft: '', vertical_drop: '', average_pitch: '', max_pitch: '',
        groomed: true, description: ''
      });
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
          </TabsList>

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
                    onValueChange={(val) => setRunForm({ ...runForm, resort_id: val })}
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
                  <Label htmlFor="lift">Lift(s)</Label>
                  <Input
                    id="lift"
                    value={runForm.lift}
                    onChange={(e) => setRunForm({ ...runForm, lift: e.target.value })}
                    placeholder="e.g. Chair 4, Gondola"
                    className="mt-1 rounded-lg"
                  />
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
        </Tabs>
      </div>
    </div>
  );
}
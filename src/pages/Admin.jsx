import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/apiClient';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const ENTITY_DEFINITIONS = {
  Resort: {
    label: 'Resorts',
    columns: [
      'id',
      'created_date',
      'updated_date',
      'created_by',
      'name',
      'location',
      'country',
      'latitude',
      'longitude',
      'map_image_url',
      'website',
      'vertical_drop',
      'base_elevation',
      'peak_elevation'
    ],
    sample: { name: '', location: '', country: '' }
  },
  Run: {
    label: 'Runs',
    columns: ['id', 'name', 'resort_id', 'official_difficulty'],
    sample: { name: '', resort_id: '', official_difficulty: 'green' }
  },
  DifficultyRating: {
    label: 'Ratings',
    columns: ['id', 'run_id', 'mode', 'rating', 'created_by'],
    sample: { run_id: '', mode: 'ski', rating: 5, skill_level: 'intermediate', conditions: 'groomed', comment: '' }
  },
  ConditionNote: {
    label: 'Notes',
    columns: ['id', 'run_id', 'note', 'created_by'],
    sample: { run_id: '', note: '', tags: [] }
  },
  CrossResortComparison: {
    label: 'Comparisons',
    columns: ['id', 'run1_id', 'run2_id', 'comparison_type'],
    sample: { run1_id: '', run2_id: '', comparison_type: 'similar', note: '' }
  },
  User: {
    label: 'Users',
    columns: ['id', 'email', 'full_name', 'role'],
    sample: { email: '', full_name: '', role: 'user', password: '' }
  }
};

const RESORT_FORM_FIELDS = [
  { key: 'name', label: 'Name', required: true, placeholder: 'Whistler Blackcomb' },
  { key: 'location', label: 'Location', required: true, placeholder: 'Whistler, BC' },
  { key: 'country', label: 'Country', placeholder: 'Canada' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com' },
  { key: 'map_image_url', label: 'Map Image URL', placeholder: 'https://example.com/map.jpg' },
  { key: 'latitude', label: 'Latitude', type: 'number', step: 'any', placeholder: '50.1163' },
  { key: 'longitude', label: 'Longitude', type: 'number', step: 'any', placeholder: '-122.9574' },
  { key: 'vertical_drop', label: 'Vertical Drop (ft)', type: 'number', step: '1', placeholder: '5020' },
  { key: 'base_elevation', label: 'Base Elevation (ft)', type: 'number', step: '1', placeholder: '2140' },
  { key: 'peak_elevation', label: 'Peak Elevation (ft)', type: 'number', step: '1', placeholder: '7160' }
];

const RESORT_NUMBER_FIELDS = new Set(['latitude', 'longitude', 'vertical_drop', 'base_elevation', 'peak_elevation']);

function toResortFormValues(item = {}) {
  return RESORT_FORM_FIELDS.reduce((acc, field) => {
    const rawValue = item[field.key];
    acc[field.key] = rawValue === null || rawValue === undefined ? '' : String(rawValue);
    return acc;
  }, {});
}

function buildResortPayload(formValues) {
  const payload = {};

  for (const field of RESORT_FORM_FIELDS) {
    const value = (formValues[field.key] ?? '').toString().trim();

    if (RESORT_NUMBER_FIELDS.has(field.key)) {
      if (!value) {
        payload[field.key] = null;
      } else {
        const parsed = Number(value);
        payload[field.key] = Number.isFinite(parsed) ? parsed : null;
      }
      continue;
    }

    payload[field.key] = value || null;
  }

  payload.name = (payload.name || '').trim();
  payload.location = (payload.location || '').trim();
  if (!payload.name || !payload.location) {
    throw new Error('Resort name and location are required.');
  }

  return payload;
}

function ResortFormFields({ values, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {RESORT_FORM_FIELDS.map((field) => (
        <div key={field.key} className={field.key === 'map_image_url' || field.key === 'website' ? 'md:col-span-2' : ''}>
          <Label htmlFor={`resort-${field.key}`}>{field.label}</Label>
          <Input
            id={`resort-${field.key}`}
            className="mt-1"
            type={field.type || 'text'}
            step={field.step}
            value={values[field.key] ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [entity, setEntity] = useState('Resort');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [jsonValue, setJsonValue] = useState('');
  const [resortFormValues, setResortFormValues] = useState(() => toResortFormValues(ENTITY_DEFINITIONS.Resort.sample));

  const def = useMemo(() => ENTITY_DEFINITIONS[entity] || ENTITY_DEFINITIONS.Resort, [entity]);

  const showAdminError = (message) => {
    toast({
      title: 'Admin action failed',
      description: message,
      variant: 'destructive',
    });
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const list = await api.entities[entity].list();
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      showAdminError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    setPendingLoading(true);
    try {
      const list = await api.editRequests.listPending();
      setPendingRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      showAdminError(err.message || 'Failed to load pending requests');
    } finally {
      setPendingLoading(false);
    }
  };

  const handleDeletePendingRequest = async (requestId) => {
    if (!requestId) return;
    if (!window.confirm('Delete this edit request?')) return;
    try {
      await api.editRequests.delete(requestId);
      loadPendingRequests();
    } catch (err) {
      showAdminError(err.message || 'Failed to delete request');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || 0 == 0) {
      loadItems();
    }
  }, [entity, user?.role]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPendingRequests();
    }
  }, [user?.role]);

  const openCreate = () => {
    setEditing(null);
    if (entity === 'Resort') {
      setResortFormValues(toResortFormValues(def.sample));
    } else {
      setJsonValue(JSON.stringify(def.sample, null, 2));
    }
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    if (entity === 'Resort') {
      setResortFormValues(toResortFormValues(item));
    } else {
      setJsonValue(JSON.stringify(item, null, 2));
    }
    setDialogOpen(true);
  };

  const handleResortFieldChange = (key, value) => {
    setResortFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = entity === 'Resort' ? buildResortPayload(resortFormValues) : JSON.parse(jsonValue);
      if (editing) {
        await api.entities[entity].update(editing.id, payload);
      } else {
        await api.entities[entity].create(payload);
      }
      setDialogOpen(false);
      loadItems();
    } catch (err) {
      showAdminError(err.message || 'Failed to save');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.entities[entity].delete(item.id);
      loadItems();
    } catch (err) {
      showAdminError(err.message || 'Failed to delete');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="w-full px-4 py-8 lg:px-8">
        <Card className="p-6">
          <h1 className="text-xl font-semibold mb-3">Admin</h1>
          <p className="text-sm text-slate-600">
            You must be an administrator to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 lg:px-8">
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Pending Edit Requests</h2>
              <p className="text-sm text-slate-600 mt-1">Suggestions submitted by users for review.</p>
            </div>
            <Button variant="outline" onClick={loadPendingRequests} disabled={pendingLoading}>
              Refresh
            </Button>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>created</TableHead>
                  <TableHead>type</TableHead>
                  <TableHead>item</TableHead>
                  <TableHead>suggestion</TableHead>
                  <TableHead>from</TableHead>
                  <TableHead className="text-right">actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">Loading...</TableCell>
                  </TableRow>
                ) : pendingRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-600">No pending requests.</TableCell>
                  </TableRow>
                ) : (
                  pendingRequests.map((req) => {
                    const isRun = (req.entity_type || '').toLowerCase() === 'run';
                    const itemName = isRun ? (req.run?.name || req.run_id) : (req.resort?.name || req.resort_id);
                    const itemUrl = isRun
                      ? createPageUrl(`RunDetail?id=${encodeURIComponent(req.run_id || '')}`)
                      : createPageUrl(`Resort?id=${encodeURIComponent(req.resort_id || '')}`);

                    const fromText = req.submitter_email
                      ? `${req.submitter_name ? `${req.submitter_name} ` : ''}<${req.submitter_email}>`
                      : (req.submitter_name || req.created_by || 'Anonymous');

                    const createdText = req.created_date ? new Date(req.created_date).toLocaleString() : '';

                    return (
                      <TableRow key={req.id}>
                        <TableCell className="text-xs text-slate-600 whitespace-nowrap">{createdText}</TableCell>
                        <TableCell className="text-xs text-slate-600 whitespace-nowrap">{req.entity_type}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          <Link to={itemUrl} className="text-sky-700 hover:underline">
                            {itemName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-slate-800 max-w-[520px]">
                          <div className="truncate" title={req.suggestion || ''}>{req.suggestion}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 whitespace-nowrap">{fromText}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePendingRequest(req.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 mb-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Manage app data (Resorts, Runs, Ratings, Notes, Comparisons, Users).</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 xl:justify-self-end">
          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Select entity" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ENTITY_DEFINITIONS).map(([key, def]) => (
                <SelectItem key={key} value={key}>{def.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="whitespace-nowrap">New {def.label.slice(0, -1)}</Button>
        </div>
      </div>

      <Card className="p-0 w-full">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {def.columns.map(col => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
                <TableHead className="sticky right-0 z-20 bg-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={def.columns.length + 1} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={def.columns.length + 1} className="text-center py-10">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    {def.columns.map((col) => (
                      <TableCell key={col} className="font-mono text-xs">
                        {item[col] ?? ''}
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 z-10 bg-white text-right whitespace-nowrap space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Create'} {def.label.slice(0, -1)}</DialogTitle>
            <DialogDescription>
              {entity === 'Resort'
                ? 'Use the form to edit resort details. Required fields are enforced by the backend.'
                : 'Edit JSON directly. Required fields are enforced by the backend.'}
            </DialogDescription>
          </DialogHeader>
          {entity === 'Resort' ? (
            <ResortFormFields values={resortFormValues} onChange={handleResortFieldChange} />
          ) : (
            <Textarea
              className="h-80 w-full font-mono text-xs"
              value={jsonValue}
              onChange={(e) => setJsonValue(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

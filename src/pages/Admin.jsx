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
    sample: { name: '', location: '', country: '' }
  },
  Run: {
    label: 'Runs',
    sample: { name: '', resort_id: '', official_difficulty: 'green' }
  },
  Lift: {
    label: 'Lifts',
    sample: { name: '', resort_id: '', status: 'open', lift_type: 'chairlift', seat_count: 4, vertical_rise_ft: 1200, ride_minutes_avg: 7.5 }
  },
  DifficultyRating: {
    label: 'Ratings',
    sample: { run_id: '', mode: 'ski', rating: 5, skill_level: 'intermediate', conditions: 'groomed', comment: '' }
  },
  ConditionNote: {
    label: 'Notes',
    sample: { run_id: '', note: '', tags: [] }
  },
  CrossResortComparison: {
    label: 'Comparisons',
    sample: { run1_id: '', run2_id: '', comparison_type: 'similar', note: '' }
  },
  LiftWaitReport: {
    label: 'Lift Wait Reports',
    sample: { resort_id: '', lift_id: '', lift_name: '', wait_minutes: 5, report_status: 'open' }
  },
  LiftStatusUpdate: {
    label: 'Lift Status Updates',
    sample: { resort_id: '', lift_id: '', lift_name: '', status: 'open', reason: '' }
  },
  User: {
    label: 'Users',
    sample: { email: '', full_name: '', role: 'user', password: '' }
  }
};

const ENTITY_FORM_FIELDS = {
  Resort: [
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
  ],
  Run: [
    { key: 'name', label: 'Name', required: true },
    { key: 'resort_id', label: 'Resort', required: true, relation: 'Resort' },
    { key: 'official_difficulty', label: 'Official Difficulty', type: 'select', options: ['green', 'blue', 'black', 'double_black', 'terrain_park'] },
    { key: 'lift_id', label: 'Lift', relation: 'Lift' },
    { key: 'lift', label: 'Lift Name' },
    { key: 'length_ft', label: 'Length (ft)', type: 'number', step: '1' },
    { key: 'vertical_drop', label: 'Vertical Drop (ft)', type: 'number', step: '1' },
    { key: 'average_pitch', label: 'Average Pitch', type: 'number', step: 'any' },
    { key: 'max_pitch', label: 'Max Pitch', type: 'number', step: 'any' },
    { key: 'groomed', label: 'Groomed', type: 'boolean' },
    { key: 'description', label: 'Description', type: 'textarea' }
  ],
  Lift: [
    { key: 'name', label: 'Name', required: true },
    { key: 'resort_id', label: 'Resort', required: true, relation: 'Resort' },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'closed', 'hold'] },
    { key: 'lift_type', label: 'Lift Type', type: 'select', options: ['chairlift', 'gondola', 'tram', 'magic_carpet', 't_bar', 'rope_tow', 'funicular', 'other'] },
    { key: 'seat_count', label: 'Seats', type: 'number', step: '1' },
    { key: 'vertical_rise_ft', label: 'Vertical Rise (ft)', type: 'number', step: '1' },
    { key: 'ride_minutes_avg', label: 'Ride Minutes', type: 'number', step: 'any' }
  ],
  DifficultyRating: [
    { key: 'run_id', label: 'Run', required: true, relation: 'Run' },
    { key: 'mode', label: 'Mode', type: 'select', options: ['ski', 'snowboard'] },
    { key: 'rating', label: 'Rating', type: 'number', required: true, step: '1' },
    { key: 'skill_level', label: 'Skill Level', type: 'select', options: ['beginner', 'intermediate', 'advanced', 'expert'] },
    { key: 'conditions', label: 'Conditions' },
    { key: 'comment', label: 'Comment', type: 'textarea' }
  ],
  ConditionNote: [
    { key: 'run_id', label: 'Run', required: true, relation: 'Run' },
    { key: 'note', label: 'Note', required: true, type: 'textarea' },
    { key: 'tags', label: 'Tags (JSON array)', type: 'json' }
  ],
  CrossResortComparison: [
    { key: 'run1_id', label: 'Run 1', required: true, relation: 'Run' },
    { key: 'run2_id', label: 'Run 2', required: true, relation: 'Run' },
    { key: 'comparison_type', label: 'Comparison Type', type: 'select', options: ['easier', 'harder', 'similar'] },
    { key: 'note', label: 'Note', type: 'textarea' }
  ],
  LiftWaitReport: [
    { key: 'resort_id', label: 'Resort', required: true, relation: 'Resort' },
    { key: 'run_id', label: 'Run', relation: 'Run' },
    { key: 'lift_id', label: 'Lift', relation: 'Lift' },
    { key: 'lift_name', label: 'Lift Name' },
    { key: 'wait_minutes', label: 'Wait Minutes', type: 'number', required: true, step: '1' },
    { key: 'report_status', label: 'Report Status', type: 'select', options: ['open', 'closed', 'hold'] },
    { key: 'snow_condition', label: 'Snow Condition' },
    { key: 'visibility', label: 'Visibility' },
    { key: 'wind', label: 'Wind' },
    { key: 'date_observed', label: 'Date Observed (ISO)' },
    { key: 'day_of_week', label: 'Day of Week', type: 'number', step: '1' },
    { key: 'hour_of_day', label: 'Hour of Day', type: 'number', step: '1' },
    { key: 'idempotency_key', label: 'Idempotency Key' }
  ],
  LiftStatusUpdate: [
    { key: 'resort_id', label: 'Resort', required: true, relation: 'Resort' },
    { key: 'run_id', label: 'Run', relation: 'Run' },
    { key: 'lift_id', label: 'Lift', relation: 'Lift' },
    { key: 'lift_name', label: 'Lift Name' },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'closed', 'hold'], required: true },
    { key: 'reason', label: 'Reason', type: 'textarea' },
    { key: 'expected_reopen_at', label: 'Expected Reopen At (ISO)' },
    { key: 'verified', label: 'Verified', type: 'boolean' }
  ],
  User: [
    { key: 'email', label: 'Email', required: true },
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'role', label: 'Role', type: 'select', options: ['user', 'admin'] },
    { key: 'password', label: 'Password' }
  ]
};

function toFormValues(fields, item = {}) {
  return fields.reduce((acc, field) => {
    const rawValue = item[field.key];
    acc[field.key] = rawValue === null || rawValue === undefined ? '' : String(rawValue);
    return acc;
  }, {});
}

function buildPayload(fields, formValues) {
  const payload = {};

  for (const field of fields) {
    const value = (formValues[field.key] ?? '').toString().trim();

    if (field.type === 'number') {
      if (!value) {
        payload[field.key] = null;
      } else {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
          throw new Error(`${field.label} must be a valid number.`);
        }
        payload[field.key] = parsed;
      }
      continue;
    }

    if (field.type === 'boolean') {
      payload[field.key] = value === '' ? null : value === 'true';
      continue;
    }

    if (field.type === 'json') {
      if (!value) {
        payload[field.key] = null;
      } else {
        payload[field.key] = JSON.parse(value);
      }
      continue;
    }

    payload[field.key] = value || null;
  }

  for (const field of fields) {
    if (field.required && (payload[field.key] === null || payload[field.key] === '')) {
      throw new Error(`${field.label} is required.`);
    }
  }

  return payload;
}

function getOptionLabel(relation, item) {
  if (relation === 'Resort') {
    return `${item.name || item.id}${item.location ? ` (${item.location})` : ''}`;
  }
  if (relation === 'Run') {
    return `${item.name || item.id}${item.resort_id ? ` (${item.resort_id.slice(0, 8)})` : ''}`;
  }
  if (relation === 'Lift') {
    return `${item.name || item.id}${item.resort_id ? ` (${item.resort_id.slice(0, 8)})` : ''}`;
  }
  if (relation === 'User') {
    return item.email || item.id;
  }
  return item.name || item.email || item.id;
}

function EntityFormFields({ entity, values, onChange, relationOptions }) {
  const fields = ENTITY_FORM_FIELDS[entity] || [];
  const selectedResortId = values.resort_id || '';

  const getFilteredOptions = (field) => {
    const options = relationOptions?.[field.relation] || [];
    if (!selectedResortId) {
      return options;
    }
    if (field.relation === 'Run' || field.relation === 'Lift') {
      return options.filter((option) => option.resort_id === selectedResortId);
    }
    return options;
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
          <Label htmlFor={`${entity}-${field.key}`}>{field.label}</Label>
          {field.relation ? (
            <Select value={values[field.key] ?? '__unset__'} onValueChange={(value) => onChange(field.key, value === '__unset__' ? '' : value)}>
              <SelectTrigger id={`${entity}-${field.key}`} className="mt-1">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {!field.required && <SelectItem value="__unset__">Unset</SelectItem>}
                {getFilteredOptions(field).map((option) => (
                  <SelectItem key={option.id || option.email} value={option.id || option.email}>
                    {getOptionLabel(field.relation, option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'select' ? (
            <Select value={values[field.key] ?? ''} onValueChange={(value) => onChange(field.key, value)}>
              <SelectTrigger id={`${entity}-${field.key}`} className="mt-1">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'textarea' || field.type === 'json' ? (
            <Textarea
              id={`${entity}-${field.key}`}
              className="mt-1"
              rows={field.type === 'json' ? 4 : 3}
              placeholder={field.placeholder}
              value={values[field.key] ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          ) : field.type === 'boolean' ? (
            <Select value={values[field.key] === '' ? '__unset__' : (values[field.key] ?? '__unset__')} onValueChange={(value) => onChange(field.key, value === '__unset__' ? '' : value)}>
              <SelectTrigger id={`${entity}-${field.key}`} className="mt-1">
                <SelectValue placeholder="Unset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unset__">Unset</SelectItem>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`${entity}-${field.key}`}
              className="mt-1"
              type={field.type || 'text'}
              step={field.step}
              value={values[field.key] ?? ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          )}
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
  const [formValues, setFormValues] = useState(() => toFormValues(ENTITY_FORM_FIELDS.Resort, ENTITY_DEFINITIONS.Resort.sample));
  const [relationOptions, setRelationOptions] = useState({
    Resort: [],
    Run: [],
    Lift: [],
    User: []
  });

  const def = useMemo(() => ENTITY_DEFINITIONS[entity] || ENTITY_DEFINITIONS.Resort, [entity]);
  const formFields = useMemo(() => ENTITY_FORM_FIELDS[entity] || [], [entity]);
  const columns = useMemo(() => {
    const keys = new Set();
    items.forEach((item) => {
      Object.keys(item || {}).forEach((key) => keys.add(key));
    });

    const ordered = ['id', 'created_date', 'updated_date', 'created_by'];
    const rest = Array.from(keys).filter((key) => !ordered.includes(key)).sort((a, b) => a.localeCompare(b));
    return [...ordered.filter((key) => keys.has(key)), ...rest];
  }, [items]);

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

  const loadRelationOptions = async () => {
    try {
      const [resorts, runs, lifts, users] = await Promise.all([
        api.entities.Resort.list('name'),
        api.entities.Run.list('name', 2000),
        api.entities.Lift.list('name', 2000),
        api.entities.User.list('email', 2000)
      ]);

      setRelationOptions({
        Resort: Array.isArray(resorts) ? resorts : [],
        Run: Array.isArray(runs) ? runs : [],
        Lift: Array.isArray(lifts) ? lifts : [],
        User: Array.isArray(users) ? users : []
      });
    } catch (err) {
      showAdminError(err.message || 'Failed to load relation options');
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
    if (user?.role === 'admin') {
      loadItems();
    }
  }, [entity, user?.role]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPendingRequests();
      loadRelationOptions();
    }
  }, [user?.role]);

  const openCreate = () => {
    setEditing(null);
    setFormValues(toFormValues(formFields, def.sample));
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormValues(toFormValues(formFields, item));
    setDialogOpen(true);
  };

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => {
      if (key === 'resort_id') {
        return {
          ...prev,
          resort_id: value,
          run_id: '',
          lift_id: ''
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload(formFields, formValues);
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
            <div className="md:hidden space-y-3">
              {pendingLoading ? (
                <Card className="p-4 text-sm text-slate-600">Loading...</Card>
              ) : pendingRequests.length === 0 ? (
                <Card className="p-4 text-sm text-slate-600">No pending requests.</Card>
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
                    <Card key={`mobile-${req.id}`} className="p-3">
                      <p className="text-xs text-slate-500">{createdText}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{req.entity_type}</p>
                      <Link to={itemUrl} className="text-sm text-sky-700 hover:underline mt-1 inline-block">{itemName}</Link>
                      <p className="text-sm text-slate-700 mt-2">{req.suggestion}</p>
                      <p className="text-xs text-slate-500 mt-2">{fromText}</p>
                      <div className="mt-3">
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePendingRequest(req.id)}>
                          Delete
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            <div className="hidden md:block">
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
          </div>
        </Card>
      </div>

      <div className="grid gap-4 mb-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Manage app data (Resorts, Runs, Lifts, Lift Reports, Ratings, Notes, Comparisons, Users).</p>
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
          <div className="md:hidden space-y-3 p-3">
            {loading ? (
              <Card className="p-4 text-sm text-slate-600">Loading...</Card>
            ) : items.length === 0 ? (
              <Card className="p-4 text-sm text-slate-600">No records found.</Card>
            ) : (
              items.map((item) => (
                <Card key={`mobile-item-${item.id}`} className="p-3">
                  <div className="space-y-1">
                    {columns.slice(0, 6).map((col) => (
                      <p key={`${item.id}-${col}`} className="text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">{col}:</span>{' '}
                        {typeof item[col] === 'object' && item[col] !== null ? JSON.stringify(item[col]) : String(item[col] ?? '')}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item)} className="flex-1">
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
                <TableHead className="sticky right-0 z-20 bg-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-10">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={col} className="font-mono text-xs">
                        {typeof item[col] === 'object' && item[col] !== null
                          ? JSON.stringify(item[col])
                          : (item[col] ?? '')}
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
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Create'} {def.label.slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Use the form to edit all fields for this table. Required fields are enforced by the backend.
            </DialogDescription>
          </DialogHeader>
          <EntityFormFields entity={entity} values={formValues} onChange={handleFieldChange} relationOptions={relationOptions} />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">{editing ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

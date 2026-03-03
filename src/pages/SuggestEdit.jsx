import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function SuggestEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'run'; // 'run' or 'resort'
  const name = urlParams.get('name') || '';
  const backUrl = urlParams.get('back') || '';

  const [yourName, setYourName] = useState('');
  const [yourEmail, setYourEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    await base44.integrations.Core.SendEmail({
      to: 'ajmcallister27@gmail.com',
      subject: `vrtIQ: Suggested Edit for ${type === 'resort' ? 'Resort' : 'Run'} — ${name}`,
      body: `A user has suggested an edit on vrtIQ.\n\n` +
        `Type: ${type === 'resort' ? 'Resort' : 'Run'}\n` +
        `Name: ${name}\n\n` +
        `From: ${yourName || 'Anonymous'}${yourEmail ? ` <${yourEmail}>` : ''}\n\n` +
        `Suggestion:\n${suggestion}`
    });
    setStatus('done');
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link
        to={backUrl || createPageUrl('Home')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-xl font-bold text-slate-900 mb-1">Suggest an Edit</h1>
      <p className="text-sm text-slate-500 mb-6">
        {type === 'resort' ? 'Resort' : 'Run'}: <span className="font-medium text-slate-700">{name}</span>
      </p>

      {status === 'done' ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-2">Thanks!</h2>
          <p className="text-sm text-slate-500 mb-6">Your suggestion has been sent and will be reviewed.</p>
          <Link to={backUrl || createPageUrl('Home')}>
            <Button variant="outline" className="rounded-xl">Go Back</Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="your-name">Your Name (optional)</Label>
                <Input
                  id="your-name"
                  value={yourName}
                  onChange={e => setYourName(e.target.value)}
                  placeholder="Jane Smith"
                  className="mt-1 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="your-email">Your Email (optional)</Label>
                <Input
                  id="your-email"
                  type="email"
                  value={yourEmail}
                  onChange={e => setYourEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="mt-1 rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="suggestion">What should be changed? *</Label>
              <Textarea
                id="suggestion"
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                placeholder={`e.g. The vertical drop should be 1,200 ft, not 900 ft. Also the lift name is wrong — it's served by Chair 4.`}
                className="mt-1 rounded-lg"
                rows={5}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={!suggestion.trim() || status === 'sending'}
              className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11"
            >
              {status === 'sending' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Suggestion
                </>
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
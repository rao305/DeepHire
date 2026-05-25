'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function JobForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const job = await response.json();
        router.push(`/jobs/${job.id}`);
      }
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Job Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              rows={10}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

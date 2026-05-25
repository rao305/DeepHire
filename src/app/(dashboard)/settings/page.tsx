import { Shell } from '@/components/layout/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <Shell>
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Settings page coming soon. Manage your API keys, integrations, and preferences here.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}

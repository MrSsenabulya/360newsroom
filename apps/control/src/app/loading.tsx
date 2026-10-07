import { AppShell, RouteProgress } from '@campus360/ui';

export default function Loading() {
  return (
    <AppShell surface="control" routeProgress={<RouteProgress label="Loading control" />}>
      <div className="c360-route-loading-main" aria-hidden="true" />
    </AppShell>
  );
}

import { AppShell, RouteProgress } from '@campus360/ui';

export default function Loading() {
  return (
    <AppShell surface="newsroom" routeProgress={<RouteProgress label="Loading newsroom" />}>
      <div className="c360-route-loading-main" aria-hidden="true" />
    </AppShell>
  );
}

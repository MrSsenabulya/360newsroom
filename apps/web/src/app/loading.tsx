import { RouteProgress } from '@campus360/ui';
import { PublicChrome } from '../components/public-chrome';

export default function Loading() {
  return (
    <PublicChrome routeProgress={<RouteProgress label="Loading page" />}>
      <div className="c360-route-loading-main" aria-hidden="true" />
    </PublicChrome>
  );
}

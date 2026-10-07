import { listTopics } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../components/public-chrome';
import { StoryTile } from '../../components/story';

export const dynamic = 'force-dynamic';

export default async function TopicsPage() {
  const topics = await listTopics();

  return (
    <PublicChrome activePath="/topics">
      <SectionHead title="Topics" />
      <p className="c360-lede">Follow a beat across articles and curated collections.</p>
      <div className="c360-tile-grid c360-tile-grid--3">
        {topics.map((topic) => (
          <StoryTile
            key={topic.id}
            href={`/topics/${topic.slug}`}
            title={topic.name}
            kicker="Topic"
            deck={topic.description}
            placeholder="story"
            aspect="4x3"
          />
        ))}
      </div>
      {topics.length === 0 ? <p className="c360-meta">No topics yet.</p> : null}
    </PublicChrome>
  );
}

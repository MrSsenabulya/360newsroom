import { listStoryTipsForDesk } from '@campus360/content/tips';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';

export const dynamic = 'force-dynamic';

export default async function TipsDeskPage() {
  const { actor } = await requireNewsroomUser();
  if (!can(actor, 'editorial.review') && !can(actor, 'breaking.review')) {
    return (
      <NewsroomChrome actor={actor} activePath="/tips">
        <p className="c360-lede">Tip inbox requires review capability.</p>
      </NewsroomChrome>
    );
  }

  const tips = await listStoryTipsForDesk();

  return (
    <NewsroomChrome actor={actor} activePath="/tips">
      <p className="c360-kicker">Inbox</p>
      <h1 className="c360-title">Story tips</h1>
      <p className="c360-lede">Public submissions from `/tip`. Not auto-published.</p>
      <ul className="c360-list" style={{ marginTop: 24 }}>
        {tips.map((tip) => (
          <li key={tip.id} className="c360-list__item">
            <p className="c360-meta">
              {tip.status} · {tip.createdAt.toISOString()}
              {tip.campusHint ? ` · ${tip.campusHint}` : ''}
            </p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{tip.message}</p>
            {tip.contactOptional ? <p className="c360-meta">Contact: {tip.contactOptional}</p> : null}
          </li>
        ))}
      </ul>
      {tips.length === 0 ? <p className="c360-meta">No tips yet.</p> : null}
    </NewsroomChrome>
  );
}

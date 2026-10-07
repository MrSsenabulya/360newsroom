import { listEditorialVendors } from '@campus360/content/utility';
import { listGeographyOptions } from '@campus360/content/editorial';
import { approveVendorAction, createVendorAction, deleteVendorAction } from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../components/confirm-submit';
import { EditorialRichText } from '../../components/editorial-rich-text';

export const dynamic = 'force-dynamic';

export default async function GuideDeskPage() {
  const { actor } = await requireNewsroomUser();
  const items = await listEditorialVendors(actor);
  const { campuses } = await listGeographyOptions(actor);
  const canManage = can(actor, 'vendor.approve') || can(actor, 'editorial.create');

  return (
    <NewsroomChrome actor={actor} activePath="/guide">
      <p className="c360-kicker">Campus Guide</p>
      <h1 className="c360-title">Vendor listings</h1>

      {canManage ? (
        <form action={createVendorAction} className="c360-panel c360-stack" style={{ marginBottom: 32 }}>
          <p className="c360-kicker">New listing</p>
          <div className="c360-field">
            <label htmlFor="businessName">Business name</label>
            <input id="businessName" name="businessName" required />
          </div>
          <div className="c360-field">
            <label htmlFor="categoryName">Category</label>
            <input id="categoryName" name="categoryName" placeholder="Food, Hostels, Printing…" />
          </div>
          <EditorialRichText name="description" label="Description" />
          <div className="c360-field">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" />
          </div>
          <div className="c360-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" />
          </div>
          <div className="c360-field">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input id="whatsapp" name="whatsapp" placeholder="2567…" />
          </div>
          <div className="c360-field">
            <label htmlFor="campusId">Campus</label>
            <select id="campusId" name="campusId" defaultValue="">
              <option value="">Select campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          <button className="c360-button" type="submit">
            Save draft
          </button>
        </form>
      ) : null}

      <ul className="c360-list">
        {items.map((item) => (
          <li key={item.id} className="c360-list__item">
            <strong>{item.businessName}</strong>
            <p className="c360-meta">
              {item.listingStatus}
              {item.category ? ` · ${item.category.name}` : ''}
              {item.verified ? ' · verified' : ''}
            </p>
            <div className="c360-actions">
              <a className="c360-button c360-button--ghost" href={`/guide/${item.id}`}>
                Edit
              </a>
              {(can(actor, 'vendor.approve') || can(actor, 'editorial.publish')) &&
              item.listingStatus !== 'ACTIVE' ? (
                <form action={approveVendorAction}>
                  <input type="hidden" name="vendorId" value={item.id} />
                  <button className="c360-button c360-button--ghost" type="submit">
                    Approve & publish
                  </button>
                </form>
              ) : null}
              {canManage ? (
                <form action={deleteVendorAction}>
                  <input type="hidden" name="vendorId" value={item.id} />
                  <ConfirmSubmit
                    className="c360-button c360-button--ghost"
                    message={
                      item.listingStatus === 'ACTIVE'
                        ? 'Archive this Guide listing?'
                        : 'Delete this draft?'
                    }
                  >
                    {item.listingStatus === 'ACTIVE' ? 'Archive' : 'Delete'}
                  </ConfirmSubmit>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </NewsroomChrome>
  );
}

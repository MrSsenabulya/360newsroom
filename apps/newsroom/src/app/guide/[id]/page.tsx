import { getEditorialVendor } from '@campus360/content/utility';
import { listGeographyOptions } from '@campus360/content/editorial';
import { deleteVendorAction, updateVendorAction } from '../../actions';
import { requireNewsroomUser } from '../../../lib/session';
import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../../components/confirm-submit';
import { EditorialRichText } from '../../../components/editorial-rich-text';
import { MediaUrlField } from '../../../components/media-url-field';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditGuidePage({ params }: Props) {
  const { id } = await params;
  const { actor } = await requireNewsroomUser();
  const { campuses } = await listGeographyOptions(actor);

  let item;
  try {
    item = await getEditorialVendor(actor, id);
  } catch {
    notFound();
  }

  const campusId = item.campuses[0]?.campusId ?? '';

  return (
    <NewsroomChrome actor={actor} activePath="/guide">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Campus Guide</p>
          <h1 className="c360-title">Edit listing</h1>
        </div>
        <a className="c360-button c360-button--ghost" href="/guide">
          Back
        </a>
      </div>

      <form action={updateVendorAction} className="c360-panel c360-stack">
        <input type="hidden" name="vendorId" value={item.id} />
        <div className="c360-field">
          <label htmlFor="businessName">Business name</label>
          <input id="businessName" name="businessName" required defaultValue={item.businessName} />
        </div>
        <EditorialRichText name="description" label="Description" defaultValue={item.description} />
        <MediaUrlField
          name="logoPublicUrl"
          label="Logo image"
          defaultValue={item.logo?.publicUrl ?? ''}
        />
        <div className="c360-field">
          <label htmlFor="categoryName">Category</label>
          <input
            id="categoryName"
            name="categoryName"
            defaultValue={item.category?.name ?? ''}
          />
        </div>
        <div className="c360-field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" defaultValue={item.phone ?? ''} />
        </div>
        <div className="c360-field">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input id="whatsapp" name="whatsapp" defaultValue={item.whatsapp ?? ''} />
        </div>
        <div className="c360-field">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" defaultValue={item.address ?? ''} />
        </div>
        <div className="c360-field">
          <label htmlFor="campusId">Campus</label>
          <select id="campusId" name="campusId" defaultValue={campusId}>
            <option value="">Select campus</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>
        <button className="c360-button" type="submit">
          Save
        </button>
      </form>

      <form action={deleteVendorAction} className="c360-panel" style={{ marginTop: 24 }}>
        <input type="hidden" name="vendorId" value={item.id} />
        <ConfirmSubmit
          className="c360-button c360-button--ghost"
          message={
            item.listingStatus === 'ACTIVE'
              ? 'Archive this Guide listing?'
              : 'Delete this draft listing?'
          }
        >
          {item.listingStatus === 'ACTIVE' ? 'Archive' : 'Delete'}
        </ConfirmSubmit>
      </form>
    </NewsroomChrome>
  );
}

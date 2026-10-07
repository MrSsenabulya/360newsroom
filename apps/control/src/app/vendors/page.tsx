import { listVendorOps } from '@campus360/content/commercial';
import { ControlChrome } from '../../components/control-chrome';
import { suspendVendorAction } from '../actions';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function VendorsOpsPage() {
  const { actor } = await requireControlUser();
  const vendors = await listVendorOps(actor);

  return (
    <ControlChrome actor={actor} activePath="/vendors">
      <p className="c360-kicker">Campus Guide</p>
      <h1 className="c360-title">Vendor operations</h1>
      <p className="c360-lede">
        Public surface is Campus Guide. Approve in Newsroom; suspend here when needed.
      </p>

      <ul className="c360-list" style={{ marginTop: 24 }}>
        {vendors.map((vendor) => (
          <li key={vendor.id} className="c360-list__item">
            <strong>{vendor.businessName}</strong>
            <p className="c360-meta">
              {vendor.listingStatus}
              {vendor.category ? ` · ${vendor.category.name}` : ''}
              {vendor.featured ? ' · featured' : ''}
              {vendor.verified ? ' · verified' : ''}
            </p>
            {can(actor, 'vendor.approve') && vendor.listingStatus === 'ACTIVE' ? (
              <form action={suspendVendorAction}>
                <input type="hidden" name="vendorId" value={vendor.id} />
                <button className="c360-button c360-button--ghost" type="submit">
                  Suspend
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </ControlChrome>
  );
}

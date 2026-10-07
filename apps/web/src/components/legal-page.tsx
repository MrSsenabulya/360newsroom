import { PublicChrome } from './public-chrome';

type Props = {
  kicker: string;
  title: string;
  children: React.ReactNode;
};

export function LegalPage({ kicker, title, children }: Props) {
  return (
    <PublicChrome activePath="/">
      <p className="c360-label">{kicker}</p>
      <h1 className="c360-title">{title}</h1>
      <div className="c360-stack" style={{ marginTop: 24, maxWidth: '42rem' }}>
        {children}
      </div>
    </PublicChrome>
  );
}
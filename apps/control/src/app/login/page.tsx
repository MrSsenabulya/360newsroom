import { createServerSupabaseClient } from '@campus360/auth/server';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <main className="c360-main" style={{ maxWidth: 480 }}>
      <img
        className="c360-brand__logo"
        src="/brand/logo.svg"
        alt="Campus 360"
        width={180}
        height={75}
        decoding="async"
        style={{ height: 48, width: 'auto', marginBottom: 'var(--space-4)' }}
      />
      <p className="c360-kicker">360 Control</p>
      <h1 className="c360-title">Sign in</h1>
      <p className="c360-lede">Management access only. Deep editorial work stays in the Newsroom.</p>
      <LoginForm />
    </main>
  );
}

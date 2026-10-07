'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';

type Props = {
  success?: string | null;
  error?: string | null;
};

export function FlashToast({ success, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(Boolean(success || error));
  const tone = error ? 'error' : 'success';
  const message = error || success;

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const hide = window.setTimeout(() => setVisible(false), 4500);
    const clean = window.setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, 500);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(clean);
    };
  }, [message, pathname, router]);

  if (!visible || !message) return null;

  return (
    <div className={`c360-toast c360-toast--${tone}`} role="status" aria-live="polite">
      <FontAwesomeIcon
        icon={tone === 'error' ? faCircleXmark : faCircleCheck}
        className="c360-icon"
        aria-hidden
      />
      <span>{message}</span>
      <button
        type="button"
        className="c360-toast__close"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
}

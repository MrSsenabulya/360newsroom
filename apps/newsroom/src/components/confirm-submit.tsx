'use client';

type Props = {
  message: string;
  children: React.ReactNode;
  className?: string;
};

export function ConfirmSubmit({ message, children, className }: Props) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}

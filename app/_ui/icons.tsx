"use client";

export function Icon({
  children,
  size = 22,
  className = "",
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {children}
    </svg>
  );
}

export function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        d="M9.5 7.8v8.4a.9.9 0 0 0 1.36.78l7.05-4.2a.9.9 0 0 0 0-1.56l-7.05-4.2A.9.9 0 0 0 9.5 7.8Z"
        fill="currentColor"
      />
    </Icon>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        d="M9.2 12.8 7.4 11a1 1 0 1 0-1.4 1.4l2.5 2.5a1 1 0 0 0 1.4 0l8.1-8.1a1 1 0 1 0-1.4-1.4l-7.4 7.4Z"
        fill="currentColor"
      />
    </Icon>
  );
}

export function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
        fill="currentColor"
      />
    </Icon>
  );
}

export function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H15a1 1 0 0 1-1-1v-5H10v5a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
        fill="currentColor"
      />
    </Icon>
  );
}

export function DumbbellIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        d="M6 9a2 2 0 0 1 2-2h1v10H8a2 2 0 0 1-2-2V9Zm9-2h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1V7ZM10 10h4v4h-4v-4Z"
        fill="currentColor"
      />
      <path
        d="M3.5 10a1.5 1.5 0 0 1 1.5-1.5H6v7H5A1.5 1.5 0 0 1 3.5 14v-4Zm17 4a1.5 1.5 0 0 1-1.5 1.5H18v-7h1a1.5 1.5 0 0 1 1.5 1.5v4Z"
        fill="currentColor"
        opacity=".7"
      />
    </Icon>
  );
}

export function ChevronBackIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className} size={22}>
      <path
        d="M14.2 5.3a.9.9 0 0 0-1.1-.1l-6.5 5.4a.9.9 0 0 0 0 1.4l6.5 5.4a.9.9 0 0 0 1.1-.1.8.8 0 0 0 .1-1.1L8.5 12l5.7-4.5a.8.8 0 0 0 .1-1.1Z"
        fill="currentColor"
      />
    </Icon>
  );
}

export function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className} size={20}>
      <path
        d="M9.3 5.2a.9.9 0 0 1 0-1.2.7.7 0 0 1 1 0l5.5 5.2a.9.9 0 0 1 0 1.3l-5.5 5.2a.7.7 0 0 1-1 0 .9.9 0 0 1 0-1.2L14 12l-4.7-4.3a.9.9 0 0 1-.1-1.1Z"
        fill="currentColor"
      />
    </Icon>
  );
}

export function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        d="M12 2l1.2 4.1L17 7.3l-3.8 1.2L12 12l-1.2-3.5L7 7.3l3.8-1.2L12 2Z"
        fill="currentColor"
      />
      <path
        d="M19 12l.7 2.2 2.3.8-2.3.8L19 18l-.7-2.2-2.3-.8 2.3-.8L19 12Z"
        fill="currentColor"
        opacity=".7"
      />
    </Icon>
  );
}


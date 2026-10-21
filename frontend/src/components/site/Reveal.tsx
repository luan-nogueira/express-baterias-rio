interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// Plain wrapper. Scroll-in animations were removed: content must be visible at rest
// (crawlers, screenshots, slow phones) and the motion read as template-made.
export function Reveal({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

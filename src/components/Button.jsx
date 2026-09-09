export default function Button({
  as: Component = 'button',
  children,
  className = '',
  variant = 'primary',
  ...props
}) {
  const variants = {
    primary:
      'bg-brand-purple text-white shadow-soft hover:bg-[#3e006d] hover:shadow-lift',
    secondary:
      'bg-white text-brand-purple ring-1 ring-brand-purple/10 hover:ring-brand-purple/30',
    gold: 'bg-brand-gold text-brand-ink shadow-soft hover:bg-[#c4a02e]',
  };

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-300 disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

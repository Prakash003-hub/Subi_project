function Button({ children, variant = 'primary', className = '', type = 'button', ...rest }) {
  const modeClass = {
    primary: 'btn-primary',
    solid: 'btn-solid',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  }[variant];

  return (
    <button type={type} className={`btn ${modeClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export default Button;

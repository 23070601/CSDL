interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-p4 font-semibold text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'ring-2 ring-status-error' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-p5 text-status-error">{error}</p>
      )}
      {helperText && (
        <p className="mt-1 text-p5 text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}

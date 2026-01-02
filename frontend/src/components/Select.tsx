interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export default function Select({
  label,
  error,
  options,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-p4 font-semibold text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <select
        className={`input-field ${error ? 'ring-2 ring-status-error' : ''}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-p5 text-status-error">{error}</p>
      )}
    </div>
  );
}

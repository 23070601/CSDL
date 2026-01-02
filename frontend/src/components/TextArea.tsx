interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({
  label,
  error,
  ...props
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-p4 font-semibold text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`input-field resize-none ${
          error ? 'ring-2 ring-status-error' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-p5 text-status-error">{error}</p>
      )}
    </div>
  );
}

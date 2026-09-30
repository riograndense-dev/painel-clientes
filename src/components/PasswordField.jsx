import { Eye, EyeOff } from 'lucide-react';

// Mesmo estilo de input usado no Login e nos formulários do Dashboard
export const INPUT_CLASS =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition pr-11';

/**
 * Campo de senha com botão de mostrar/ocultar, no padrão visual do portal.
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  showPass,
  onToggle,
  autoComplete = 'current-password',
  placeholder = '••••••••',
  disabled = false,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1"
        style={{ color: 'var(--color-grafite)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPass ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required
          className={INPUT_CLASS}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          tabIndex={-1}
          aria-label={showPass ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

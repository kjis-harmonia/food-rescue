interface ToggleSwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label={label}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-[#0D4436]' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string; group?: string; disabled?: boolean };

type Props = {
  options: SelectOption[];
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Submit the surrounding form as soon as an option is picked. */
  autoSubmit?: boolean;
  size?: "md" | "sm";
  /** "input" looks like a form field; "inline" is bare text, for use inside chips and sentences. */
  variant?: "input" | "inline";
  id?: string;
  className?: string;
  "aria-label"?: string;
};

type Position = { left: number; width: number; top?: number; bottom?: number; maxHeight: number };

/**
 * A styled replacement for <select>. It renders a hidden input so it works in
 * plain forms and server actions, supports option groups and full keyboard use,
 * and draws its list in a portal so cards and scroll containers can't clip it.
 */
export function Select({
  options,
  name,
  defaultValue = "",
  placeholder = "Select…",
  required,
  disabled,
  autoSubmit,
  size = "md",
  variant = "input",
  id,
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<Position | null>(null);
  const [invalid, setInvalid] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitNext = useRef(false);
  const typeahead = useRef({ text: "", at: 0 });
  const listId = useId();
  const { pending } = useFormStatus();

  const isDisabled = disabled || (autoSubmit && pending);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];
  const enabled = (i: number) => i >= 0 && i < options.length && !options[i].disabled;

  // Server actions reset their form after submitting; follow suit.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => setValue(defaultValue);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue]);

  // Submit only after the hidden input holds the new value.
  useEffect(() => {
    if (!submitNext.current) return;
    submitNext.current = false;
    inputRef.current?.form?.requestSubmit();
  }, [value]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const width = Math.max(r.width, variant === "inline" || size === "sm" ? 200 : 0);
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
      const below = window.innerHeight - r.bottom - 12;
      const above = r.top - 12;
      const up = below < 200 && above > below;
      setPos({
        left,
        width,
        top: up ? undefined : r.bottom + 6,
        bottom: up ? window.innerHeight - r.top + 6 : undefined,
        maxHeight: Math.min(300, up ? above : below),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, size, variant]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) panelRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, pos]);

  function openList() {
    if (isDisabled) return;
    setActive(enabled(selectedIndex) ? selectedIndex : options.findIndex((o) => !o.disabled));
    setOpen(true);
  }

  function choose(i: number) {
    if (!enabled(i)) return;
    setOpen(false);
    setInvalid(false);
    triggerRef.current?.focus();
    if (options[i].value === value) return;
    if (autoSubmit) submitNext.current = true;
    setValue(options[i].value);
  }

  function step(from: number, dir: 1 | -1) {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (enabled(i)) return i;
    return from;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => step(a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => step(a, -1));
        break;
      case "Home":
        e.preventDefault();
        setActive(step(-1, 1));
        break;
      case "End":
        e.preventDefault();
        setActive(step(options.length, -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          // Type-to-jump, like a native select.
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
          t.at = now;
          const match = options.findIndex((o, i) => enabled(i) && o.label.toLowerCase().startsWith(t.text));
          if (match >= 0) setActive(match);
        }
    }
  }

  const triggerCls =
    variant === "inline"
      ? `inline-flex items-center gap-1 rounded text-amber-200 outline-none hover:text-amber-100 focus-visible:ring-2 focus-visible:ring-lav-400/40 ${className}`
      : `input flex items-center justify-between gap-2 text-left ${size === "sm" ? "py-1.5 text-xs" : ""} ${
          open ? "border-lav-400 ring-2 ring-lav-400/25" : invalid ? "border-red-400/70" : ""
        } ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`;

  return (
    <div className={`relative ${variant === "inline" ? "inline-block" : "w-full"}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={isDisabled}
        className={triggerCls}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={`truncate ${selected ? "" : variant === "inline" ? "" : "text-subtle"}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={variant === "inline" || size === "sm" ? 12 : 15} className={`shrink-0 text-subtle transition-transform duration-200 ${open ? "rotate-180 text-lav-300" : ""}`} />
      </button>

      {/* Carries the value for form submission and native `required` validation. */}
      <input
        ref={inputRef}
        name={name}
        value={value}
        required={required}
        onChange={() => {}}
        onInvalid={(e) => {
          e.preventDefault();
          setInvalid(true);
          triggerRef.current?.focus();
        }}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
      />
      {invalid && variant === "input" && <p className="mt-1 text-[11px] text-red-300">Please choose an option.</p>}

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
            className="animate-pop z-[100] overflow-y-auto overscroll-contain rounded-xl border border-line-strong bg-ink-850/95 p-1 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.8),0_0_0_1px_rgb(161_140_255/0.08)] backdrop-blur-xl"
          >
            {options.length === 0 && <div className="px-3 py-2.5 text-xs text-subtle">No options</div>}
            {options.map((o, i) => {
              const header = o.group && o.group !== options[i - 1]?.group;
              const isSelected = i === selectedIndex;
              return (
                <div key={`${o.group ?? ""}|${o.value}`}>
                  {header && (
                    <div role="presentation" className={`px-3 pb-1 font-mono text-[10px] tracking-[0.15em] text-subtle uppercase ${i === 0 ? "pt-2" : "mt-1 border-t border-line pt-2.5"}`}>
                      {o.group}
                    </div>
                  )}
                  <div
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={o.disabled || undefined}
                    onMouseEnter={() => enabled(i) && setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${size === "sm" || variant === "inline" ? "text-xs" : "text-sm"} transition-colors ${
                      o.disabled ? "cursor-not-allowed text-subtle/60" : "cursor-pointer"
                    } ${i === active && !o.disabled ? "bg-lav-300/12 text-fg" : isSelected ? "text-lav-100" : o.disabled ? "" : "text-muted"}`}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected && <Check size={14} className="shrink-0 text-lav-300" />}
                  </div>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

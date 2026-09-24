"use client";

import { ReactNode } from "react";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

type Props = {
  value: Json;
  onChange: (next: Json) => void;
};

const LONG_KEYS = ["body", "paragraph", "message", "address"];

function isLongText(key: string, v: string) {
  return LONG_KEYS.includes(key.toLowerCase()) || v.length > 90;
}

function labelize(key: string) {
  const withSpaces = key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

const inputCls =
  "w-full bg-gray-900/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm";

const groupCls =
  "border border-gray-700 rounded-2xl p-4 md:p-5 space-y-4 bg-gray-950/40";

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
      {children}
    </label>
  );
}

function AddButton({ onClick, itemLabel }: { onClick: () => void; itemLabel: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-brand hover:text-white text-sm font-semibold border border-dashed border-gray-600 hover:border-brand rounded-xl px-4 py-2.5 w-full transition-colors"
    >
      + Add {itemLabel}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm"
    >
      ✕
    </button>
  );
}

function emptyLike(sample: Json): Json {
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === "object") {
    return Object.fromEntries(
      Object.entries(sample).map(([k, v]) => [k, emptyLike(v)])
    );
  }
  return "";
}

function Fields({ nodeKey, value, onChange }: Props & { nodeKey?: string }) {
  if (nodeKey === "color" && typeof value === "string") {
    const valid = /^#[0-9a-fA-F]{6}$/.test(value);
    return (
      <div>
        <FieldLabel>Color (hex code)</FieldLabel>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Pick color"
            value={valid ? value : "#3b82f6"}
            onChange={(e) => onChange(e.target.value)}
            className="w-14 h-11 rounded-lg border border-gray-600 bg-gray-900 cursor-pointer shrink-0"
          />
          <input
            className={inputCls}
            value={value}
            placeholder="#3b82f6"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (typeof value === "string") {
    const long = nodeKey ? isLongText(nodeKey, value) : false;
    return (
      <div>
        {nodeKey && <FieldLabel>{labelize(nodeKey)}</FieldLabel>}
        {long ? (
          <textarea
            rows={3}
            className={`${inputCls} resize-none`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className={inputCls}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        {nodeKey && <FieldLabel>{labelize(nodeKey)}</FieldLabel>}
        <input
          type="number"
          className={inputCls}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#3b82f6]"
        />
        {nodeKey ? labelize(nodeKey) : "Enabled"}
      </label>
    );
  }

  if (Array.isArray(value)) {
    const sample = value[0];
    return (
      <div className="space-y-3">
        {nodeKey && <FieldLabel>{labelize(nodeKey)}</FieldLabel>}
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <Fields
                nodeKey={undefined}
                value={item}
                onChange={(next) => {
                  const copy = [...value];
                  copy[i] = next;
                  onChange(copy);
                }}
              />
            </div>
            <RemoveButton
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            />
          </div>
        ))}
        <AddButton
          itemLabel={nodeKey ? labelize(nodeKey).replace(/s$/, "") : "item"}
          onClick={() =>
            onChange([...value, sample !== undefined ? emptyLike(sample) : ""])
          }
        />
      </div>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    const flat = !nodeKey;
    return (
      <div className={flat ? "space-y-4" : `${groupCls}`}>
        {!flat && nodeKey && (
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            {labelize(nodeKey)}
          </p>
        )}
        {entries.map(([k, v]) => (
          <Fields
            key={k}
            nodeKey={k}
            value={v}
            onChange={(next) => onChange({ ...value, [k]: next })}
          />
        ))}
      </div>
    );
  }

  return null;
}

export default function SectionEditor({
  content,
  onChange,
}: {
  content: Record<string, Json>;
  onChange: (next: Record<string, Json>) => void;
}) {
  return (
    <div className="space-y-5">
      {Object.entries(content).map(([key, value]) => (
        <Fields
          key={key}
          nodeKey={key}
          value={value}
          onChange={(next) => onChange({ ...content, [key]: next as Json })}
        />
      ))}
    </div>
  );
}

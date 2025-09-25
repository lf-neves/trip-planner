import React from "react";

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700 mb-6">
      {children}
    </div>
  );
}

export function DetailRow({
  label,
  value,
  bold = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <>
      <div className={`${bold ? "font-semibold text-black" : "font-medium"}`}>
        {label}
      </div>
      <div className={`${bold ? "font-semibold text-black" : ""}`}>{value}</div>
    </>
  );
}

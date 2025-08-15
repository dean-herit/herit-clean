import React from "react";

export type CellValueProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: React.ReactNode;
};

function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
  return classes
    .map(cls => {
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([className]) => className)
          .join(' ')
      }
      return cls
    })
    .filter(Boolean)
    .join(' ')
}

const CellValue = React.forwardRef<HTMLDivElement, CellValueProps>(
  ({ label, value, children, className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex items-center justify-between py-3 border-b border-theme-input-border last:border-b-0", className)} 
      {...props}
    >
      <div className="text-sm text-theme-text-muted font-medium">{label}</div>
      <div className="text-sm font-medium text-theme-text text-right">{value || children}</div>
    </div>
  ),
);

CellValue.displayName = "CellValue";

export default CellValue;
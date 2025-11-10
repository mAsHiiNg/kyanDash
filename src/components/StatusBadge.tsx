
import { Badge } from "@/components/ui/badge";
import { CustomerStatus } from "@/types";
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${CUSTOMER_STATUS_COLORS[status]} ${className}`}
    >
      {CUSTOMER_STATUS_LABELS[status]}
    </Badge>
  );
}

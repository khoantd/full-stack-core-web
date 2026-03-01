"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "./PaymentForm";
import { Payment, PaymentStatus, PaymentMethod, PaymentEvent } from "@/types/payment.type";
import { Event } from "@/types/event.type";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  events: Event[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  events,
  onSubmit,
  isLoading,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payment ? "Edit Payment" : "Create New Payment"}</DialogTitle>
          <DialogDescription>
            {payment
              ? "Update the payment details below."
              : "Fill in the details to create a new payment."}
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          payment={payment}
          events={events}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

interface PaymentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export function PaymentDetailDialog({
  open,
  onOpenChange,
  payment,
}: PaymentDetailDialogProps) {
  if (!payment) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "MMMM dd, yyyy 'at' HH:mm");
    } catch {
      return date;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>;
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      case PaymentStatus.PENDING:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Badge variant="outline">Cash</Badge>;
      case PaymentMethod.BANK_TRANSFER:
        return <Badge variant="outline">Bank Transfer</Badge>;
      case PaymentMethod.MOMO:
        return <Badge variant="outline">MoMo</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getEventTitle = (event: PaymentEvent | string): string => {
    if (typeof event === 'string') {
      return event;
    }
    return event?.title || 'N/A';
  };

  const getEventPrice = (event: PaymentEvent | string): number | null => {
    if (typeof event === 'string') {
      return null;
    }
    return event?.price || null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Payment Details</DialogTitle>
          <DialogDescription>Payment information and details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  User Name
                </h3>
                <p className="text-base font-semibold">{payment.userName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  User Email
                </h3>
                <p className="text-base">{payment.userEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Event
                </h3>
                <p className="text-base">{getEventTitle(payment.event)}</p>
                {getEventPrice(payment.event) !== null && (
                  <p className="text-sm text-muted-foreground">
                    Event Price: {formatAmount(getEventPrice(payment.event)!)}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Amount
                </h3>
                <p className="text-base font-semibold text-green-600">
                  {formatAmount(payment.amount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Payment Method
                </h3>
                {getPaymentMethodBadge(payment.paymentMethod)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </h3>
                {getStatusBadge(payment.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Transaction ID
                </h3>
                <p className="text-base">{payment.transactionId || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Paid At
                </h3>
                <p className="text-base">{formatDate(payment.paidAt)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="mb-1">Created</p>
                  <p>{formatDate(payment.createdAt)}</p>
                </div>
                <div>
                  <p className="mb-1">Last Updated</p>
                  <p>{formatDate(payment.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

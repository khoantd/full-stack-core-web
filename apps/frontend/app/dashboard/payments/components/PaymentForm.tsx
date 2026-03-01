"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payment, PaymentMethod, PaymentStatus, PaymentEvent } from "@/types/payment.type";
import { Event } from "@/types/event.type";

const paymentSchema = z.object({
  event: z.string().min(1, "Event is required"),
  userName: z.string().min(1, "User name is required"),
  userEmail: z.string().email("Invalid email"),
  amount: z.coerce.number().min(0, "Amount must be >= 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOMO"]),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
  transactionId: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  payment?: Payment | null;
  events: Event[];
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentForm({
  payment,
  events,
  onSubmit,
  onCancel,
  isLoading,
}: PaymentFormProps) {
  const getEventId = (event: PaymentEvent | string | undefined): string => {
    if (!event) return "";
    if (typeof event === 'string') return event;
    return event._id || "";
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      event: getEventId(payment?.event),
      userName: payment?.userName || "",
      userEmail: payment?.userEmail || "",
      amount: payment?.amount || 0,
      paymentMethod: payment?.paymentMethod || PaymentMethod.CASH,
      status: payment?.status || PaymentStatus.PENDING,
      transactionId: payment?.transactionId || "",
    },
  });

  const selectedEventId = watch("event");
  const paymentMethod = watch("paymentMethod");
  const status = watch("status");

  useEffect(() => {
    if (payment) {
      reset({
        event: getEventId(payment.event),
        userName: payment.userName,
        userEmail: payment.userEmail,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId || "",
      });
    }
  }, [payment, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event">Event *</Label>
        <Select
          value={selectedEventId}
          onValueChange={(value) => setValue("event", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event._id} value={event._id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.event && (
          <p className="text-sm text-red-500">{errors.event.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userName">User Name *</Label>
        <Input
          id="userName"
          {...register("userName")}
          placeholder="Enter user name"
        />
        {errors.userName && (
          <p className="text-sm text-red-500">{errors.userName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userEmail">User Email *</Label>
        <Input
          id="userEmail"
          type="email"
          {...register("userEmail")}
          placeholder="Enter user email"
        />
        {errors.userEmail && (
          <p className="text-sm text-red-500">{errors.userEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount")}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method *</Label>
        <Select
          value={paymentMethod}
          onValueChange={(value) => setValue("paymentMethod", value as PaymentMethod)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
            <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
            <SelectItem value={PaymentMethod.MOMO}>MoMo</SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setValue("status", value as PaymentStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={PaymentStatus.SUCCESS}>Success</SelectItem>
            <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
        <Input
          id="transactionId"
          {...register("transactionId")}
          placeholder="Enter transaction ID"
        />
        {errors.transactionId && (
          <p className="text-sm text-red-500">{errors.transactionId.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : payment ? "Update Payment" : "Create Payment"}
        </Button>
      </div>
    </form>
  );
}

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
import { Event } from "@/types/event.type";
import Image from "next/image";

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

export function EventDetailDialog({
  open,
  onOpenChange,
  event,
}: EventDetailDialogProps) {
  if (!event) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMMM dd, yyyy 'at' HH:mm");
    } catch {
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
          <DialogDescription>Event details and information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {event.image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h3>
              <p className="text-base">{event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Location
                </h3>
                <p className="text-base">{event.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Price
                </h3>
                <p className="text-base font-semibold">
                  {formatPrice(event.price)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Capacity
                </h3>
                <p className="text-base">{event.capacity ?? "Unlimited"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Registration Type
                </h3>
                <p className="text-base capitalize">{event.registrationType?.replace("_", " ") ?? "paid"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Start Date
                </h3>
                <p className="text-base">{formatDate(event.startDate)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  End Date
                </h3>
                <p className="text-base">{formatDate(event.endDate)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </h3>
              <Badge variant={event.isPublished ? "default" : "secondary"}>
                {event.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="mb-1">Created</p>
                  <p>{formatDate(event.createdAt)}</p>
                </div>
                <div>
                  <p className="mb-1">Last Updated</p>
                  <p>{formatDate(event.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent, useEventAttendees, useRegisterAttendee, useUpdateAttendeeStatus } from "@/hooks/useEvent";
import { eventApi } from "@/lib/api/event.api";
import { AttendeeStatus } from "@/types/event.type";

const STATUS_COLORS: Record<string, string> = {
  registered: "bg-green-500",
  waitlisted: "bg-yellow-500",
  attended: "bg-blue-500",
  cancelled: "bg-red-500",
};

export default function AttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [registerOpen, setRegisterOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: attendees = [], isLoading: attendeesLoading } = useEventAttendees(eventId);
  const registerMutation = useRegisterAttendee();
  const updateStatusMutation = useUpdateAttendeeStatus();

  const handleRegister = async () => {
    if (!name || !email) return;
    try {
      await registerMutation.mutateAsync({ eventId, data: { name, email } });
      toast.success("Attendee registered");
      setRegisterOpen(false);
      setName("");
      setEmail("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register attendee");
    }
  };

  const handleStatusChange = async (attendeeId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ eventId, attendeeId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleExport = () => {
    const url = eventApi.exportAttendees(eventId);
    window.open(url, "_blank");
  };

  if (eventLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Attendees</h1>
          {event && <p className="text-muted-foreground">{event.title}</p>}
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
        <Button onClick={() => setRegisterOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />Register Attendee
        </Button>
      </div>

      {event && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Registered</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{attendees.filter(a => a.status === "registered").length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Capacity</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{event.capacity ?? "Unlimited"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Waitlisted</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{attendees.filter(a => a.status === "waitlisted").length}</p></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {attendeesLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No attendees yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map(a => (
                    <TableRow key={a._id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[a.status] || ""} text-white`}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(a.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Select value={a.status} onValueChange={val => handleStatusChange(a._id, val)}>
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered">Registered</SelectItem>
                            <SelectItem value="waitlisted">Waitlisted</SelectItem>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Attendee</DialogTitle>
            <DialogDescription>Add a new attendee to this event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="mt-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
              <Button onClick={handleRegister} disabled={registerMutation.isPending || !name || !email}>
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

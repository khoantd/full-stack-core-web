"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateUser, useUpdateUser, useRoles } from "@/hooks/useUsers";
import type { User } from "@/api/types";

// Form validation schema
const userFormSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc").max(100, "Tên không được quá 100 ký tự"),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z.string().optional(),
  role: z.string().optional(),
  securityConfirmed: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null; // If provided, it's edit mode
  onSuccess?: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const isEditMode = !!user;

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: rolesData } = useRoles();
  const roles = rolesData?.data ?? [];

  const isLoading = createUser.isPending || updateUser.isPending;

  // Get user ID - handle both _id and id
  const getUserId = (user: User | null | undefined): string | null => {
    if (!user) return null;
    return user._id?.toString() || user.id?.toString() || null;
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      securityConfirmed: false,
    },
  });

  // Reset form when dialog opens or user changes
  React.useEffect(() => {
    if (open) {
      if (isEditMode && user) {
        // Get role ID - handle populated role object or string
        const roleId = typeof user.role === "object" && user.role !== null
          ? (user.role as { _id?: string })._id || ""
          : (user.role || "");

        form.reset({
          name: user.name || "",
          email: user.email || "",
          password: "", // Don't prefill password for security
          role: roleId,
          securityConfirmed: user.securityConfirmed || false,
        });
      } else {
        form.reset({
          name: "",
          email: "",
          password: "",
          role: "",
          securityConfirmed: false,
        });
      }
    }
  }, [open, user, isEditMode, form]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEditMode) {
        const userId = getUserId(user);
        if (!userId) {
          toast.error("Không tìm thấy ID user");
          return;
        }

        // Only send fields that have values
        const updateData: Record<string, unknown> = {};
        if (values.name) updateData.name = values.name;
        if (values.email) updateData.email = values.email;
        if (values.password) updateData.password = values.password;
        if (values.role) updateData.role = values.role;
        updateData.securityConfirmed = values.securityConfirmed;

        await updateUser.mutateAsync({
          id: userId,
          data: updateData,
        });

        toast.success("Cập nhật user thành công");
      } else {
        // Create mode - password is required
        if (!values.password) {
          form.setError("password", { message: "Mật khẩu là bắt buộc khi tạo user" });
          return;
        }

        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role || undefined,
          securityConfirmed: values.securityConfirmed,
        });

        toast.success("Tạo user thành công");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi";
      toast.error(isEditMode ? "Cập nhật user thất bại" : "Tạo user thất bại", {
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa User" : "Tạo User Mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin user. Để trống mật khẩu nếu không muốn thay đổi."
              : "Nhập thông tin để tạo user mới."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên user"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mật khẩu {!isEditMode && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={isEditMode ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn role (tùy chọn)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.length > 0 ? (
                        roles.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="securityConfirmed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Xác thực bảo mật</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Đánh dấu user đã xác thực
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Cập nhật" : "Tạo User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

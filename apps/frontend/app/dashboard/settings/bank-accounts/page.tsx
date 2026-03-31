"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useBanks, useBankAccounts, useUpsertBankAccount, useDeleteBankAccount } from "@/hooks/useVietQR";
import { BankCode } from "@/types/bank.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTrash, IconPlus, IconStar } from "@tabler/icons-react";

const schema = z.object({
  bankCode: z.nativeEnum(BankCode),
  accountNumber: z.string().min(6, "Account number required"),
  accountName: z.string().min(2, "Account name required"),
  isDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BankAccountsPage() {
  const [isAdding, setIsAdding] = useState(false);

  const { data: banks = [], isLoading: banksLoading } = useBanks();
  const { data: accounts = [], isLoading: accountsLoading } = useBankAccounts();
  const upsertMutation = useUpsertBankAccount();
  const deleteMutation = useDeleteBankAccount();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isDefault: false },
  });

  const selectedBank = watch("bankCode");

  const onSubmit = (data: FormData) => {
    upsertMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Bank account saved");
        reset();
        setIsAdding(false);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to save"),
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Bank account removed"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
    });
  };

  const getBankName = (code: string) => {
    const bank = banks.find((b) => b.code === code);
    return bank ? `${bank.englishName} (${bank.code})` : code;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Bank Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your tenant's bank accounts for VietQR payment generation.
        </p>
      </div>

      {/* Existing accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configured Accounts</CardTitle>
          <CardDescription>These accounts are used to generate VietQR codes for payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountsLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No bank accounts configured yet.</p>
          ) : (
            accounts.map((acc) => (
              <div key={acc._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{getBankName(acc.bankCode)}</span>
                    {acc.isDefault && (
                      <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{acc.accountNumber} — {acc.accountName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                  onClick={() => handleDelete(acc._id)}
                  disabled={deleteMutation.isPending}
                  aria-label="Remove bank account"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add new account */}
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Bank *</Label>
                {banksLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedBank} onValueChange={(v) => setValue("bankCode", v as BankCode)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.code} value={b.code}>
                          {b.englishName} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.bankCode && <p className="text-xs text-red-500">{errors.bankCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input {...register("accountNumber")} placeholder="e.g. 1234567890" />
                {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Account Name *</Label>
                <Input {...register("accountName")} placeholder="e.g. NGUYEN VAN A" />
                {errors.accountName && <p className="text-xs text-red-500">{errors.accountName.message}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...register("isDefault")}
                  className="cursor-pointer"
                />
                <Label htmlFor="isDefault" className="cursor-pointer">Set as default account</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? "Saving..." : "Save Account"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { reset(); setIsAdding(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="cursor-pointer">
          <IconPlus size={16} className="mr-2" />
          Add Bank Account
        </Button>
      )}
    </div>
  );
}

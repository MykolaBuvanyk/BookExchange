import { Save, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { Button, Field, Input, Label, SelectDropdown } from "@/components/ui";
import type { AdminUserFormValues } from "@/features/admin/adminUsersService";
import type { UserProfile, UserRole } from "@/types";

const roleOptions = [
  { label: "User", value: "user" },
  { label: "Admin", value: "admin" },
] satisfies Array<{ label: string; value: UserRole }>;

type AdminUserFormProps = {
  editingUser: UserProfile | null;
  form: AdminUserFormValues;
  isSubmitting: boolean;
  onClose: () => void;
  onFieldChange: (
    field: keyof AdminUserFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (role: UserRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminUserForm({
  editingUser,
  form,
  isSubmitting,
  onClose,
  onFieldChange,
  onRoleChange,
  onSubmit,
}: AdminUserFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded-md border border-white/20 p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold text-white">
          {editingUser ? "Edit user" : "Add user"}
        </h2>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X size={16} />
          Close
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <Label htmlFor="admin-user-name">Name</Label>
          <Input
            id="admin-user-name"
            value={form.name}
            onChange={onFieldChange("name")}
            required
          />
        </Field>
        <Field>
          <Label htmlFor="admin-user-email">Email</Label>
          <Input
            id="admin-user-email"
            type="email"
            value={form.email}
            onChange={onFieldChange("email")}
            required
          />
        </Field>
        <SelectDropdown
          label="Role"
          options={roleOptions}
          value={form.role}
          onChange={onRoleChange}
        />
      </div>

      <Button type="submit" className="sm:w-fit" disabled={isSubmitting}>
        <Save size={16} />
        {isSubmitting ? "Saving..." : "Save user"}
      </Button>
    </form>
  );
}

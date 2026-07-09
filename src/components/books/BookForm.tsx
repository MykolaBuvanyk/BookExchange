import { X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { Button, Field, FieldError, Input, Label } from "@/components/ui";
import type { Book, BookFormValues, BookPhotoSource } from "@/types";
import { BookPhotoInput } from "./BookPhotoInput";

type BookFormProps = {
  editingBook: Book | null;
  error: string | null;
  fileName: string;
  form: BookFormValues;
  isSubmitting: boolean;
  photoSource: BookPhotoSource;
  onClose: () => void;
  onFieldChange: (
    field: keyof BookFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoSourceChange: (photoSource: BookPhotoSource) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function BookForm({
  editingBook,
  error,
  fileName,
  form,
  isSubmitting,
  photoSource,
  onClose,
  onFieldChange,
  onFileChange,
  onPhotoSourceChange,
  onSubmit,
}: BookFormProps) {
  return (
    <form className="rounded-md border border-white/20 p-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold text-white">
          {editingBook ? "Edit book" : "Add new book"}
        </h2>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X size={16} />
          Close
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field>
          <Label htmlFor="bookName">Title</Label>
          <Input
            id="bookName"
            value={form.name}
            onChange={onFieldChange("name")}
            placeholder="Kobzar"
          />
        </Field>

        <Field>
          <Label htmlFor="bookAuthor">Author</Label>
          <Input
            id="bookAuthor"
            value={form.author}
            onChange={onFieldChange("author")}
            placeholder="Taras Shevchenko"
          />
        </Field>

        <BookPhotoInput
          fileName={fileName}
          photoSource={photoSource}
          photoUrl={form.photoUrl || ""}
          onFileChange={onFileChange}
          onPhotoSourceChange={onPhotoSourceChange}
          onPhotoUrlChange={onFieldChange("photoUrl")}
        />
      </div>

      {error ? <FieldError className="mt-4">{error}</FieldError> : null}

      <Button className="mt-5" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : editingBook ? "Save changes" : "Add book"}
      </Button>
    </form>
  );
}

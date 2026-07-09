import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { Field, Input, Label } from "@/components/ui";
import type { BookPhotoSource } from "@/types";

type BookPhotoInputProps = {
  fileName: string;
  photoSource: BookPhotoSource;
  photoUrl: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoSourceChange: (photoSource: BookPhotoSource) => void;
  onPhotoUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function BookPhotoInput({
  fileName,
  photoSource,
  photoUrl,
  onFileChange,
  onPhotoSourceChange,
  onPhotoUrlChange,
}: BookPhotoInputProps) {
  return (
    <div className="md:col-span-2">
      <Label>Book photo</Label>
      <div className="mt-2 grid grid-cols-2 rounded-md border border-white p-1">
        <button
          className={
            photoSource === "url"
              ? "rounded-sm bg-white px-3 py-2 text-sm font-medium text-black"
              : "rounded-sm px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
          }
          onClick={() => onPhotoSourceChange("url")}
          type="button"
        >
          Photo URL
        </button>
        <button
          className={
            photoSource === "file"
              ? "rounded-sm bg-white px-3 py-2 text-sm font-medium text-black"
              : "rounded-sm px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
          }
          onClick={() => onPhotoSourceChange("file")}
          type="button"
        >
          Upload file
        </button>
      </div>

      {photoSource === "url" ? (
        <Field className="mt-4">
          <Label htmlFor="bookPhoto">Photo URL</Label>
          <Input
            id="bookPhoto"
            value={photoUrl}
            onChange={onPhotoUrlChange}
            placeholder="https://..."
          />
        </Field>
      ) : (
        <Field className="mt-4">
          <Label htmlFor="bookPhotoFile">Upload photo</Label>
          <label
            className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-white bg-black px-3 text-sm text-white transition-colors hover:bg-white hover:text-black"
            htmlFor="bookPhotoFile"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Upload size={18} />
              <span className="truncate">{fileName || "Choose image file"}</span>
            </span>
            <span className="shrink-0 text-xs opacity-70">Browse</span>
          </label>
          <input
            className="sr-only"
            id="bookPhotoFile"
            accept="image/*"
            onChange={onFileChange}
            type="file"
          />
          <p className="text-sm text-zinc-500">
            This uses the uploaded file only. It will not fill the URL field.
          </p>
        </Field>
      )}
    </div>
  );
}

export function ImageUploadCard({ imageFile, imagePreviewUrl, onSelectImage }) {
  return (
    <section className="card-base p-6">
      <h2 className="text-2xl font-semibold">Recipe imagery</h2>
      <label className="mt-6 block rounded-3xl border border-dashed border-primary/25 bg-surface-muted/60 p-8 text-center">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => onSelectImage(event.target.files?.[0] ?? null)}
        />
        {imagePreviewUrl ? (
          <div className="space-y-4">
            <img
              src={imagePreviewUrl}
              alt={imageFile ? `${imageFile.name} preview` : 'Recipe preview'}
              className="mx-auto aspect-[4/3] w-full rounded-3xl object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-primary-dark">{imageFile?.name ?? 'Image ready'}</p>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                This file will be uploaded to Firebase Storage and linked to the recipe after save.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-primary-dark">Upload a cover image</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Choose a PNG, JPG, or WebP image. The final recipe will store its canonical image in Firebase
              Storage.
            </p>
          </div>
        )}
      </label>
    </section>
  )
}

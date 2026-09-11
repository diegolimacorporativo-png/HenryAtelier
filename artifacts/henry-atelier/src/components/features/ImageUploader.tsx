import React, { useRef, useState, useCallback } from "react";
import { Upload, Link2, X, ImagePlus, Camera } from "lucide-react";

interface ImageUploaderProps {
  value: string; // URL or base64
  onChange: (value: string) => void;
}

type InputMode = "file" | "url";

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [mode, setMode] = useState<InputMode>("file");
  const [urlInput, setUrlInput] = useState(value.startsWith("http") ? value : "");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido (JPG, PNG, WebP, GIF).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 10 MB.");
        return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setUploading(false);
      };
      reader.onerror = () => {
        alert("Erro ao ler o arquivo. Tente novamente.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const hasImage = Boolean(value);

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded overflow-hidden border border-stone-200 w-fit">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
            mode === "file"
              ? "bg-stone-900 text-white"
              : "bg-white text-stone-500 hover:text-stone-700"
          }`}
        >
          <Camera size={13} />
          Arquivo
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wide transition-colors border-l border-stone-200 ${
            mode === "url"
              ? "bg-stone-900 text-white"
              : "bg-white text-stone-500 hover:text-stone-700"
          }`}
        >
          <Link2 size={13} />
          URL
        </button>
      </div>

      {/* File upload zone */}
      {mode === "file" && (
        <>
          {/* Hidden file input — accept images, capture camera on mobile */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="sr-only"
            id="img-upload-input"
            aria-label="Selecionar imagem"
          />

          {hasImage && !value.startsWith("http") ? (
            /* Preview after upload */
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="w-full max-w-[200px] h-40 object-cover border border-stone-200"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow"
                aria-label="Remover imagem"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 block w-full max-w-[200px] text-center text-xs text-stone-500 hover:text-gold border border-stone-200 py-1.5 transition-colors"
              >
                Trocar imagem
              </button>
            </div>
          ) : (
            /* Drop zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded transition-colors cursor-pointer ${
                dragging
                  ? "border-gold bg-gold/5"
                  : "border-stone-200 hover:border-stone-400 bg-stone-50"
              }`}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              aria-label="Área de upload de imagem"
            >
              <label
                htmlFor="img-upload-input"
                className="flex flex-col items-center justify-center gap-3 py-8 px-4 cursor-pointer select-none"
              >
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-stone-500">Processando...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                      <ImagePlus size={22} className="text-stone-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-stone-700">
                        Toque para selecionar
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        ou arraste uma imagem aqui
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        JPG, PNG, WebP · Máx. 10 MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 bg-stone-900 text-white text-xs px-3 py-2 rounded font-medium">
                        <Upload size={13} />
                        Escolher arquivo
                      </div>
                    </div>
                  </>
                )}
              </label>
            </div>
          )}
        </>
      )}

      {/* URL input mode */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm min-w-0"
              aria-label="URL da imagem"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-3 bg-stone-900 text-white text-sm font-semibold hover:bg-gold transition-colors whitespace-nowrap flex-shrink-0"
            >
              Aplicar
            </button>
          </div>
          {/* URL Preview */}
          {value && value.startsWith("http") && (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="w-20 h-20 object-cover border border-stone-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow"
                aria-label="Remover imagem"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

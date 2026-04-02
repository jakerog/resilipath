import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Upload, X, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface EvidenceUploadProps {
  tenantId: string;
  exerciseId: string;
  taskId: string;
  onUploadComplete: (url: string) => void;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  tenantId,
  exerciseId,
  taskId,
  onUploadComplete
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const storagePath = `/tenants/${tenantId}/evidence/${exerciseId}/${taskId}/${file.name}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      onUploadComplete(downloadURL);
      setSuccess(true);
    } catch (err: any) {
      console.error('Evidence upload failed:', err);
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }, [tenantId, exerciseId, taskId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
  });

  return (
    <SkeuomorphicContainer inset className="p-0">
      <div
        {...getRootProps()}
        className={clsx(
          "p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center",
          isDragActive ? "border-brand-accent bg-brand-accent/5" : "border-brand-secondary/20 hover:border-brand-accent/50",
          success && "border-brand-success bg-brand-success/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {success ? (
            <CheckCircle className="w-10 h-10 text-brand-success animate-bounce" />
          ) : (
            <Upload className={clsx("w-10 h-10 transition-colors", isDragActive ? "text-brand-accent" : "text-brand-secondary/40")} />
          )}

          <p className="text-sm font-semibold text-brand-primary">
            {uploading ? "Uploading Evidence..." :
             success ? "Evidence Captured!" :
             "Capture Task Evidence"}
          </p>
          <p className="text-xs text-brand-secondary opacity-60">
            {success ? "File securely stored with SHA-256 hash" : "Drag & drop or tap to upload photo (25MB max)"}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-2 text-xs text-brand-danger bg-brand-danger/10 rounded-lg flex items-center gap-2 justify-center">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </SkeuomorphicContainer>
  );
};

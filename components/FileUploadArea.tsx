
import React, { useCallback, useState } from 'react';
import { UploadedDocxFile } from '../types';
import { UploadCloud, FileText, XCircle } from 'lucide-react';

interface FileUploadAreaProps {
  onFilesChange: (files: File[]) => void;
  uploadedFiles: UploadedDocxFile[];
  onRemoveFile: (fileId: string) => void;
  disabled?: boolean;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesChange, uploadedFiles, onRemoveFile, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesChange(Array.from(event.target.files));
      event.target.value = ''; // Reset file input
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesChange(Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  }, [onFilesChange]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl h-full flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-sky-300">1. Upload DOCX Files</h2>
      <div
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ease-in-out
                    ${isDragging ? 'border-sky-500 bg-slate-700' : 'border-slate-600 hover:border-sky-600'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && document.getElementById('fileInput')?.click()}
      >
        <UploadCloud size={48} className={`mb-3 ${isDragging ? 'text-sky-400' : 'text-slate-400'}`} />
        <p className="text-slate-300">Drag & drop .docx files here, or click to select.</p>
        <p className="text-xs text-slate-500 mt-1">Multiple files supported.</p>
        <input
          id="fileInput"
          type="file"
          accept=".docx"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3 max-h-60 overflow-y-auto pr-2">
          <h3 className="text-lg font-medium text-slate-300">Selected Files:</h3>
          {uploadedFiles.map(uploadedFile => (
            <div key={uploadedFile.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-md shadow">
              <div className="flex items-center">
                <FileText size={20} className="text-sky-400 mr-3" />
                <span className="text-sm text-slate-200 truncate" title={uploadedFile.file.name}>{uploadedFile.file.name}</span>
              </div>
              <button
                onClick={() => !disabled && onRemoveFile(uploadedFile.id)}
                className={`text-slate-500 hover:text-red-400 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Remove file"
                disabled={disabled}
              >
                <XCircle size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

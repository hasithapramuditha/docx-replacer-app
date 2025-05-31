
import React, { useState, useCallback, useEffect } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { PlaceholderRule, UploadedDocxFile, ExtractedPlaceholder, ReplacementValues, AppState } from './types';
import { FileUploadArea } from './components/FileUploadArea';
import { RuleManagement } from './components/RuleManagement';
import { PlaceholderTable } from './components/PlaceholderTable';
import { ActionButton } from './components/ActionButton';
import { Header } from './components/Header';
import { Alert, AlertType } from './components/Alert';
import { Loader2, Info } from 'lucide-react';

// Helper to generate unique IDs
const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocxFile[]>([]);
  const [placeholderRules, setPlaceholderRules] = useState<PlaceholderRule[]>([
    { id: generateId(), start: '[', end: ']' },
  ]);
  const [extractedPlaceholders, setExtractedPlaceholders] = useState<ExtractedPlaceholder[]>([]);
  const [replacementValues, setReplacementValues] = useState<ReplacementValues>({});
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFilesChange = (files: File[]) => {
    setAppState(AppState.LOADING_FILES);
    const newDocxFiles: UploadedDocxFile[] = files
      .filter(file => file.name.endsWith('.docx'))
      .map(file => ({ id: generateId(), file }));
    
    if (newDocxFiles.length !== files.length) {
      setError("Some files were not .docx format and were ignored.");
    }
    setUploadedFiles(prevFiles => [...prevFiles, ...newDocxFiles]); // Allow appending files
    setExtractedPlaceholders([]); // Reset placeholders if new files are added
    setReplacementValues({});
    setAppState(AppState.IDLE);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    setExtractedPlaceholders([]); 
    setReplacementValues({});
  };

  const handleExtractPlaceholders = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one DOCX file.");
      return;
    }
    if (placeholderRules.length === 0) {
      setError("Please define at least one placeholder rule.");
      return;
    }

    setAppState(AppState.EXTRACTING_PLACEHOLDERS);
    setError(null);
    setSuccessMessage(null);
    const allFoundPlaceholders = new Set<string>();

    try {
      for (const uploadedFile of uploadedFiles) {
        const arrayBuffer = await uploadedFile.file.arrayBuffer();
        
        for (const rule of placeholderRules) {
          if (!rule.start || !rule.end) {
            console.warn(`Skipping rule with empty delimiters: ${rule.id}`);
            continue;
          }
          try {
            const zip = new PizZip(arrayBuffer);
            const tagsInCurrentFileAndRule = new Set<string>();
            const customParser = (tag: string) => {
              if (tag && tag.trim() !== "") { // Add tag if not empty or whitespace only
                tagsInCurrentFileAndRule.add(tag.trim());
              }
              return { 
                get: () => '', // Return dummy value, we only care about collecting tags
                
              };
            };
            
            const doc = new Docxtemplater(zip, {
              parser: customParser,
              delimiters: { start: rule.start, end: rule.end },
              linebreaks: true, // Process documents with line breaks correctly
            });

            doc.render({}); // Render with empty data to trigger parser for all tags

            tagsInCurrentFileAndRule.forEach(tag => allFoundPlaceholders.add(tag));
          } catch (e: any) {
            // Errors here might be due to invalid DOCX structure for a specific rule, or corrupt file
            // We can choose to log and continue, or show a more prominent error.
            // For now, log it, as other rules/files might succeed.
            console.error(`Error processing file ${uploadedFile.file.name} with rule ${rule.start}...${rule.end}: ${e.message}`);
          }
        }
      }

      const uniquePlaceholders = Array.from(allFoundPlaceholders).map(name => ({ name }));
      setExtractedPlaceholders(uniquePlaceholders);
      if (uniquePlaceholders.length > 0) {
        setSuccessMessage(`Found ${uniquePlaceholders.length} unique placeholder(s).`);
         // Initialize replacementValues with empty strings
        const initialReplacements: ReplacementValues = {};
        uniquePlaceholders.forEach(ph => {
          initialReplacements[ph.name] = '';
        });
        setReplacementValues(initialReplacements);
      } else {
        setSuccessMessage("No placeholders found matching the current rules.");
      }
    } catch (e: any) {
      setError(`Error extracting placeholders: ${e.message}`);
      console.error(e);
    } finally {
      setAppState(AppState.IDLE);
    }
  }, [uploadedFiles, placeholderRules]);

  const handleProcessAndDownload = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setError("No files to process.");
      return;
    }
    if (extractedPlaceholders.length > 0 && Object.keys(replacementValues).length === 0) {
        // This case implies placeholders were extracted, but map is empty. Should be pre-filled.
        // If extractedPlaceholders is empty, it's fine to proceed (no replacements needed).
    }
    if (placeholderRules.length === 0 && extractedPlaceholders.length > 0) {
        // This is an unlikely state, means placeholders were extracted with rules that are now gone.
        // For safety, require rules if placeholders are expected.
        setError("Placeholder rules are missing, cannot process replacements.");
        return;
    }


    setAppState(AppState.PROCESSING_FILES);
    setError(null);
    setSuccessMessage(null);
    let filesProcessedCount = 0;

    try {
      for (const uploadedFile of uploadedFiles) {
        let currentDocBuffer: ArrayBuffer = await uploadedFile.file.arrayBuffer();

        for (const rule of placeholderRules) {
          if (!rule.start || !rule.end) continue; 
          try {
            const zip = new PizZip(currentDocBuffer);
            const doc = new Docxtemplater(zip, {
              delimiters: { start: rule.start, end: rule.end },
              linebreaks: true,
            });
            
            // Filter replacementValues to only include keys that might be relevant for this rule's tags
            // Docxtemplater itself will only use data for tags it finds with current delimiters
            doc.setData(replacementValues);
            doc.render();

            currentDocBuffer = doc.getZip().generate({ 
              type: "arraybuffer",
              mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });
          } catch (e: any) {
             // Log error for this specific rule/file combination and continue with the (potentially partially processed) buffer
            console.error(`Error applying rule ${rule.start}...${rule.end} on file ${uploadedFile.file.name}: ${e.message}`);
            // Potentially add to a list of per-file errors to show user.
          }
        }
        
        const finalBlob = new Blob([currentDocBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const originalName = uploadedFile.file.name;
        const newName = originalName.substring(0, originalName.lastIndexOf('.')) + '_modified.docx';
        saveAs(finalBlob, newName);
        filesProcessedCount++;
      }
      if (filesProcessedCount > 0) {
        setSuccessMessage(`Successfully processed and downloaded ${filesProcessedCount} file(s).`);
      } else {
        setError("No files were processed. Check logs for errors.");
      }

    } catch (e: any) {
      setError(`Error processing files: ${e.message}`);
      console.error(e);
    } finally {
      setAppState(AppState.IDLE);
    }
  }, [uploadedFiles, placeholderRules, replacementValues, extractedPlaceholders]);

  const isLoading = appState !== AppState.IDLE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 flex flex-col items-center p-4 md:p-8 selection:bg-sky-500 selection:text-white">
      <Header />

      {error && <Alert type={AlertType.Error} message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type={AlertType.Success} message={successMessage} onClose={() => setSuccessMessage(null)} />}
      
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FileUploadArea onFilesChange={handleFilesChange} uploadedFiles={uploadedFiles} onRemoveFile={handleRemoveFile} disabled={isLoading}/>
          <RuleManagement rules={placeholderRules} setRules={setPlaceholderRules} disabled={isLoading}/>
        </div>

        <div className="text-center">
          <ActionButton
            onClick={handleExtractPlaceholders}
            disabled={isLoading || uploadedFiles.length === 0 || placeholderRules.length === 0}
            className="bg-sky-600 hover:bg-sky-500"
          >
            {appState === AppState.EXTRACTING_PLACEHOLDERS ? <Loader2 className="animate-spin mr-2" /> : null}
            Extract Placeholders
          </ActionButton>
        </div>

        {extractedPlaceholders.length > 0 && (
          <PlaceholderTable
            placeholders={extractedPlaceholders}
            replacementValues={replacementValues}
            onReplacementChange={setReplacementValues}
            disabled={isLoading}
          />
        )}
        
        {(uploadedFiles.length > 0) && (
             <div className="text-center mt-8">
                <ActionButton
                onClick={handleProcessAndDownload}
                disabled={isLoading || uploadedFiles.length === 0 }
                className="bg-green-600 hover:bg-green-500"
                >
                {appState === AppState.PROCESSING_FILES ? <Loader2 className="animate-spin mr-2" /> : null}
                Process & Download Files
                </ActionButton>
            </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
            <Loader2 className="w-16 h-16 animate-spin text-sky-500" />
            <span className="ml-4 text-xl font-semibold">
              {appState === AppState.EXTRACTING_PLACEHOLDERS && "Extracting placeholders..."}
              {appState === AppState.PROCESSING_FILES && "Processing files..."}
              {appState === AppState.LOADING_FILES && "Loading files..."}
            </span>
          </div>
        )}
      </div>
      <footer className="w-full max-w-6xl mx-auto mt-12 text-center text-sm text-slate-400 pb-8">
        DOCX Placeholder Replacer | Built with React, Tailwind CSS, and Docxtemplater
      </footer>
    </div>
  );
};

export default App;

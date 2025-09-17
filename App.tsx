
import React, { useState, useCallback } from 'react';
import { removeBackgroundFromImage } from './services/geminiService';
import { toBase64, getMimeType } from './utils/fileUtils';
import { ImagePreview } from './components/ImagePreview';
import { UploadIcon, MagicWandIcon, DownloadIcon, ErrorIcon, SparklesIcon } from './components/Icons';

type ProcessedResult = {
  image: string;
  text: string;
};

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage(null);
      setProcessedResult(null);
      setError(null);
      setFileName(file.name);
      setOriginalFile(file);
      try {
        const base64 = await toBase64(file) as string;
        setOriginalImage(base64);
      } catch (err) {
        setError('Failed to read the image file. Please try another one.');
        console.error(err);
      }
    }
  };

  const handleRemoveBackground = useCallback(async () => {
    if (!originalFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedResult(null);

    try {
      const base64Data = originalImage!.split(',')[1];
      const mimeType = getMimeType(originalFile.name) || originalFile.type;

      if (!mimeType) {
        throw new Error('Could not determine image type. Please use a standard format (PNG, JPG, WEBP).');
      }

      const result = await removeBackgroundFromImage(base64Data, mimeType);
      
      if (!result.image) {
        throw new Error(result.text || 'The AI model did not return an image. Please try again.');
      }

      setProcessedResult(result);

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred while processing the image.';
      setError(`Error: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalFile, originalImage]);
  
  const getOutputFilename = () => {
    if (!fileName) return 'download.png';
    const nameParts = fileName.split('.');
    nameParts.pop(); // remove extension
    return `${nameParts.join('.')}_no-bg.png`;
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-6xl text-center mb-8">
        <div className="flex items-center justify-center gap-4">
          <SparklesIcon className="w-10 h-10 text-indigo-400" />
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            AI Background Remover
          </h1>
        </div>
        <p className="mt-4 text-lg text-gray-400">
          Powered by Gemini's 'nano-banana' model to instantly remove image backgrounds.
        </p>
      </header>

      <main className="w-full max-w-6xl flex-grow bg-gray-800/50 rounded-2xl shadow-2xl shadow-indigo-900/20 p-4 sm:p-8 backdrop-blur-sm border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-semibold text-gray-200 border-b-2 border-indigo-500 pb-2">1. Upload Image</h2>
            <ImagePreview title="Original Image" imageSrc={originalImage} />
            <div className="flex flex-col items-center space-y-4">
               <label htmlFor="file-upload" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <UploadIcon className="w-6 h-6 mr-2"/>
                  <span>{fileName ? `Change: ${fileName}` : 'Choose an image...'}</span>
              </label>
              <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
              
              <button
                onClick={handleRemoveBackground}
                disabled={!originalImage || isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105"
              >
                <MagicWandIcon className="w-6 h-6 mr-2" />
                <span>{isLoading ? 'Processing...' : 'Remove Background'}</span>
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-semibold text-gray-200 border-b-2 border-purple-500 pb-2">2. Get Result</h2>
            <ImagePreview title="Processed Image" imageSrc={processedResult?.image} isLoading={isLoading} />
             {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                <ErrorIcon className="w-5 h-5 mr-3"/>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {processedResult && (
              <div className="flex flex-col items-center space-y-4">
                 {processedResult.text && (
                  <p className="text-sm text-gray-400 italic bg-gray-800 p-3 rounded-lg text-center">
                    AI Note: "{processedResult.text}"
                  </p>
                )}
                <a
                  href={`data:image/png;base64,${processedResult.image}`}
                  download={getOutputFilename()}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                >
                  <DownloadIcon className="w-6 h-6 mr-2" />
                  <span>Download Image</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="w-full max-w-6xl text-center mt-8 text-gray-500 text-sm">
        <p>This is an AI-generated application. Results may vary.</p>
      </footer>
    </div>
  );
};

export default App;

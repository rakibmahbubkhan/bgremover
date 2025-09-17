
import React from 'react';
import { ImageIcon } from './Icons';

interface ImagePreviewProps {
  title: string;
  imageSrc: string | null;
  isLoading?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ title, imageSrc, isLoading = false }) => {
  return (
    <div className="w-full aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      {!imageSrc && !isLoading && (
        <div className="text-center text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-2" />
          <p className="font-semibold">{title}</p>
        </div>
      )}
      {imageSrc && (
        <img 
            src={imageSrc.startsWith('data:') ? imageSrc : `data:image/png;base64,${imageSrc}`}
            alt={title} 
            className="max-w-full max-h-full object-contain"
        />
      )}
    </div>
  );
};

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SiGoogledrive } from 'react-icons/si';
import { Search, FileText, ImageIcon, BarChart3, PresentationIcon, FileQuestion, UploadCloud } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
  size?: string;
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/drive/files');
        const raw = await res.text();
        console.log('Réponse brute /api/drive/files:', raw);
        if (!res.ok) {
          throw new Error(raw || `HTTP ${res.status}`);
        }
        const data = JSON.parse(raw);
        setFiles(data.files || []);
      } catch (err: unknown) {
        console.error('Erreur lors de la récupération des fichiers Drive:', err);
        const errorMessage = err instanceof Error ? err.message : 'Échec du chargement des documents';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      const idToken = await user!.getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        clearInterval(progressInterval);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec du téléchargement du fichier');
      }
      
      const data = await response.json();
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setFiles((prev) => [data.file, ...prev]);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        toast.success('Fichier téléchargé avec succès !');
      }, 500);
    } catch (error: unknown) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      const errorMessage = error instanceof Error ? error.message : 'Échec du téléchargement du fichier. Veuillez réessayer.';
      toast.error(errorMessage);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (size?: string | number): string => {
    if (!size) return 'Taille inconnue';
    
    if (typeof size === 'string' && isNaN(Number(size))) {
      return size;
    }
    
    const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
    
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
    return '📁';
  };

  const getFileTypeCategory = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Tableur';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Présentation';
    return 'Autre';
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date inconnue';
    }
  };

  if (!user) {
    return null;
  }

  const filteredFiles = files.filter(file => {
    const nameMatch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = selectedType ? getFileTypeCategory(file.mimeType) === selectedType : true;
    return nameMatch && typeMatch;
  });

  const filterButtons = [
    { name: 'PDF', icon: <FileText className="mr-2 h-4 w-4" /> },
    { name: 'Document', icon: <FileText className="mr-2 h-4 w-4" /> },
    { name: 'Image', icon: <ImageIcon className="mr-2 h-4 w-4" /> },
    { name: 'Tableur', icon: <BarChart3 className="mr-2 h-4 w-4" /> },
    { name: 'Présentation', icon: <PresentationIcon className="mr-2 h-4 w-4" /> },
    { name: 'Autre', icon: <FileQuestion className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight dark:text-slate-100">Mes Documents</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Recherchez, filtrez et gérez vos fichiers téléchargés.</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button
              asChild
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              <span className="inline-flex items-center">
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? 'Téléchargement...' : 'Télécharger un document'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input 
              type="text"
              placeholder="Rechercher des documents par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant={selectedType === null ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setSelectedType(null)}
            className="dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-700"
          >
            All Types
          </Button>
          {filterButtons.map(button => (
            <Button 
              key={button.name} 
              variant={selectedType === button.name ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setSelectedType(button.name)}
              className="dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-700"
            >
              {button.icon}
              {button.name}
            </Button>
          ))}
        </div>
      </div>

      {uploading && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Uploading...</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="dark:text-slate-300">Loading documents...</p>
        </div>
      ) : files.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-6 dark:border-slate-700">
          <p className="text-lg font-medium dark:text-slate-100">No documents found</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Upload your first document to get started.</p>
        </div>
      ) : filteredFiles.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-6 dark:border-slate-700">
          <p className="text-lg font-medium dark:text-slate-100">No documents match your search or filters</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
                  <span className="sr-only">Icône</span>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider w-32 whitespace-nowrap">
                  Taille
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider w-40 whitespace-nowrap">
                  Date de téléchargement
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xl">
                    {getFileIcon(file.mimeType)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                    <Dialog>
                      <DialogTrigger asChild>
                        <span 
                          className="text-sm text-slate-900 dark:text-slate-100 hover:underline cursor-pointer truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {file.name}
                        </span>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-slate-900 dark:border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-slate-900 dark:text-slate-50">{file.name}</DialogTitle>
                          <DialogDescription className="text-slate-600 dark:text-slate-400">
                            {formatFileSize(file.size)} • Uploaded on {formatDate(file.createdTime)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="my-4">
                          <iframe 
                            src={file.webViewLink ? file.webViewLink.replace('/view', '/preview') : undefined}
                            className="w-full h-96 border rounded-md dark:border-slate-700"
                            title={file.name}
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button 
                            asChild 
                            size="sm" 
                            variant="default" 
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white flex items-center justify-center gap-2 py-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                              <SiGoogledrive className="h-5 w-5" />
                              Open in Google Drive
                            </a>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(file.createdTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
        // Call our Pages API, no auth header needed
        const res = await fetch('/api/drive/files');
        const raw = await res.text();
        console.log('Raw /api/drive/files response:', raw);
        if (!res.ok) {
          throw new Error(raw || `HTTP ${res.status}`);
        }
        const data = JSON.parse(raw);
        setFiles(data.files || []);
      } catch (err: any) {
        console.error('Error fetching Drive files:', err);
        toast.error(err.message || 'Failed to load documents');
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
      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Get the current user's ID token
      const idToken = await user!.getIdToken();
      
      // Create form data for the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file to the API
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
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add the new file to the list
      setFiles((prev) => [data.file, ...prev]);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        toast.success('File uploaded successfully!');
      }, 500);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (size?: string | number): string => {
    if (!size) return 'Unknown size';
    
    // If size is already a string and not just a number, return it
    if (typeof size === 'string' && isNaN(Number(size))) {
      return size;
    }
    
    // Convert to number
    const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
    
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
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

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-500">Upload and manage your documents</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              asChild
              disabled={uploading}
            >
              <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
            </Button>
          </label>
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
          <p>Loading documents...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-6">
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-gray-500 mt-2">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="text-3xl mr-3">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <h3 className="text-lg font-medium truncate hover:underline cursor-pointer">
                            {file.name}
                          </h3>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                            <DialogDescription>
                              {formatFileSize(file.size)} • Uploaded on {formatDate(file.createdTime)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center items-center p-4">
                            <iframe 
                              src={file.webViewLink}
                              className="w-full h-96 border rounded"
                              title={file.name}
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button asChild size="sm">
                              <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                                Open in Google Drive
                              </a>
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <p className="text-sm text-gray-500 truncate">
                        {formatFileSize(file.size)} • {formatDate(file.createdTime)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
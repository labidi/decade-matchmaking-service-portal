<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Request as OCDRequest;
use App\Enums\DocumentType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class DocumentService
{
    /**
     * Store a document for a request
     */
    public function storeDocument(UploadedFile $file, DocumentType $documentType, OCDRequest $request, int $uploaderId): Document
    {
        try {
            $path = $file->store('documents', 'public');

            $document = Document::create([
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'file_type' => $file->getMimeType(),
                'document_type' => $documentType,
                'parent_id' => $request->id,
                'parent_type' => OCDRequest::class,
                'uploader_id' => $uploaderId,
            ]);

            Log::info('Document uploaded successfully', [
                'document_id' => $document->id,
                'request_id' => $request->id,
                'uploader_id' => $uploaderId,
                'file_name' => $file->getClientOriginalName()
            ]);

            return $document;

        } catch (Exception $e) {
            Log::error('Failed to upload document', [
                'request_id' => $request->id,
                'uploader_id' => $uploaderId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Delete a document
     */
    public function deleteDocument(Document $document): bool
    {
        try {
            // Delete file from storage
            Storage::disk('public')->delete($document->path);
            
            // Delete database record
            $deleted = $document->delete();

            if ($deleted) {
                Log::info('Document deleted successfully', [
                    'document_id' => $document->id,
                    'file_name' => $document->name
                ]);
            }

            return $deleted;

        } catch (Exception $e) {
            Log::error('Failed to delete document', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get documents for a request
     */
    public function getRequestDocuments(OCDRequest $request): \Illuminate\Database\Eloquent\Collection
    {
        return Document::where('parent_id', $request->id)
            ->where('parent_type', OCDRequest::class)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get documents by type for a request
     */
    public function getRequestDocumentsByType(OCDRequest $request, DocumentType $documentType): \Illuminate\Database\Eloquent\Collection
    {
        return Document::where('parent_id', $request->id)
            ->where('parent_type', OCDRequest::class)
            ->where('document_type', $documentType)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if user can access document
     */
    public function canAccessDocument(Document $document, int $userId): bool
    {
        // Document uploader can always access
        if ($document->uploader_id === $userId) {
            return true;
        }

        // Request owner can access
        if ($document->parent_type === OCDRequest::class) {
            $request = OCDRequest::find($document->parent_id);
            if ($request && $request->user_id === $userId) {
                return true;
            }
        }

        // Admin can access
        $user = \App\Models\User::find($userId);
        if ($user && $user->is_admin) {
            return true;
        }

        return false;
    }

    /**
     * Get document download response
     */
    public function getDownloadResponse(Document $document): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        if (!Storage::disk('public')->exists($document->path)) {
            throw new Exception('Document file not found');
        }

        return Storage::disk('public')->download($document->path, $document->name);
    }

    /**
     * Get document statistics
     */
    public function getDocumentStats(OCDRequest $request): array
    {
        $documents = $this->getRequestDocuments($request);

        return [
            'total' => $documents->count(),
            'by_type' => $documents->groupBy('document_type')->map->count(),
            'total_size' => $documents->sum(function ($doc) {
                return Storage::disk('public')->size($doc->path);
            })
        ];
    }
} 
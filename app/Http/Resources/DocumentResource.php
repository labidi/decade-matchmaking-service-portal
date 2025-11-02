<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Document
 */
class DocumentResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'path' => $this->path,
            'file_type' => $this->file_type,
            'document_type' => [
                'value' => $this->document_type?->value,
                'label' => $this->document_type?->label(),
            ],
            'parent_id' => $this->parent_id,
            'parent_type' => $this->parent_type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Computed properties
            'file_size' => $this->getFileSize(),
            'file_size_human' => $this->getFileSizeHuman(),
            'download_url' => $this->getDownloadUrl(),
            'file_extension' => $this->getFileExtension(),

            // Relationships
            'uploader' => $this->whenLoaded('uploader', function () {
                return new UserResource($this->uploader);
            }),

            // Permissions
            'permissions' => [
                'can_download' => $this->canDownload($request->user()),
                'can_delete' => $this->canDelete($request->user()),
            ],
        ];
    }

    /**
     * Get the file size in bytes.
     */
    private function getFileSize(): int
    {
        try {
            if (Storage::disk('public')->exists($this->path)) {
                return Storage::disk('public')->size($this->path);
            }
        } catch (\Exception $e) {
            // Log error but don't fail the response
            \Log::warning('Failed to get file size for document', [
                'document_id' => $this->id,
                'error' => $e->getMessage()
            ]);
        }

        return 0;
    }

    /**
     * Get human-readable file size.
     */
    private function getFileSizeHuman(): string
    {
        $bytes = $this->getFileSize();

        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));

        return sprintf('%.2f %s', $bytes / pow(1024, $factor), $units[$factor]);
    }

    /**
     * Get the download URL for the document.
     */
    private function getDownloadUrl(): string
    {
        return 'https://example.com';
        return route('user.document.download', ['document' => $this->id]);
    }

    /**
     * Get the file extension.
     */
    private function getFileExtension(): string
    {
        return pathinfo($this->name, PATHINFO_EXTENSION);
    }

    /**
     * Check if the current user can download this document.
     */
    private function canDownload(?\App\Models\User $user): bool
    {
        if (!$user) {
            return false;
        }

        // Document uploader can always download
        if ($this->uploader_id === $user->id) {
            return true;
        }

        // Request owner can download
        if ($this->parent_type === \App\Models\Request::class) {
            $parent = \App\Models\Request::find($this->parent_id);
            if ($parent && $parent->user_id === $user->id) {
                return true;
            }
        }

        // Offer partner can download
        if ($this->parent_type === \App\Models\Request\Offer::class) {
            $parent = \App\Models\Request\Offer::find($this->parent_id);
            if ($parent && $parent->matched_partner_id === $user->id) {
                return true;
            }
        }

        // Admin can always download
        if ($user->hasRole('administrator')) {
            return true;
        }

        return false;
    }

    /**
     * Check if the current user can delete this document.
     */
    private function canDelete(?\App\Models\User $user): bool
    {
        if (!$user) {
            return false;
        }

        // Document uploader can delete their own documents
        if ($this->uploader_id === $user->id) {
            return true;
        }

        // Admin can delete any document
        if ($user->hasRole('administrator')) {
            return true;
        }

        // Request owner can delete documents attached to their request
        if ($this->parent_type === \App\Models\Request::class) {
            $parent = \App\Models\Request::find($this->parent_id);
            if ($parent && $parent->user_id === $user->id) {
                return true;
            }
        }

        return false;
    }
}
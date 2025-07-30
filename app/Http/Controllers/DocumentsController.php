<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Request as OCDRequest;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Validation\Rule;
use App\Enums\DocumentType;
use App\Services\DocumentService;
use Exception;

class DocumentsController extends Controller
{
    public function __construct(private DocumentService $documentService)
    {
    }

    public function store(HttpRequest $httpRequest, OCDRequest $request)
    {
        $validated = $httpRequest->validate([
            'document_type' => ['required', Rule::enum(DocumentType::class)],
            'file' => ['required', 'file'],
        ]);

        try {
            $this->documentService->storeDocument(
                $httpRequest->file('file'),
                $validated['document_type'],
                $request,
                $httpRequest->user()->id
            );

            return back()->with('success', 'Document uploaded successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to upload document: ' . $e->getMessage());
        }
    }

    public function destroy(Document $document)
    {
        try {
            $this->documentService->deleteDocument($document);
            return back()->with('success', 'Document deleted successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to delete document: ' . $e->getMessage());
        }
    }

    public function download(Document $document)
    {
        try {
            return $this->documentService->getDownloadResponse($document);
        } catch (Exception $e) {
            return back()->with('error', 'Failed to download document: ' . $e->getMessage());
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Request as OCDRequest;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Enums\DocumentType;

class DocumentController extends Controller
{
    public function store(HttpRequest $httpRequest, OCDRequest $request)
    {
        $validated = $httpRequest->validate([
            'document_type' => ['required', Rule::enum(DocumentType::class)],
            'file' => ['required', 'file'],
        ]);

        $path = $httpRequest->file('file')->store('documents', 'public');

        Document::create([
            'name' => $httpRequest->file('file')->getClientOriginalName(),
            'path' => $path,
            'file_type' => $httpRequest->file('file')->getClientMimeType(),
            'document_type' => $validated['document_type'],
            'parent_id' => $request->id,
            'parent_type' => OCDRequest::class,
            'uploader_id' => $httpRequest->user()->id,
        ]);

        return back();
    }

    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back();
    }

    public function download(Document $document)
    {
        return Storage::disk('public')->download($document->path, $document->name);
    }
}

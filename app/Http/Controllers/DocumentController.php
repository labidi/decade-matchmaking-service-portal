<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Request as OCDRequest;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function store(HttpRequest $httpRequest, OCDRequest $request)
    {
        $validated = $httpRequest->validate([
            'document_type' => 'required|in:financial_breakdown_report,lesson_learned_report,offer_document',
            'file' => 'required|file',
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
}

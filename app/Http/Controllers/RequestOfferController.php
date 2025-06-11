<?php

namespace App\Http\Controllers;

use App\Models\Request as OCDRequest;
use App\Models\Request\RequestOffer;
use App\Models\Document;
use Illuminate\Http\Request as HttpRequest;
use App\Enums\RequestOfferStatus;
use App\Enums\DocumentType;

class RequestOfferController extends Controller
{
    public function store(HttpRequest $httpRequest, OCDRequest $request)
    {
        $validated = $httpRequest->validate([
            'description' => 'required|string',
            'partner_id' => 'required',
            'file' => 'required|file|mimes:pdf',
        ]);

        $offer = new RequestOffer();
        $offer->description = $validated['description'];
        $offer->matched_partner_id = $validated['partner_id'];
        $offer->request_id = $request->id;
        $offer->status = RequestOfferStatus::ACTIVE;
        $offer->save();
        $path = $httpRequest->file('file')->store('documents', 'public');


//        $ocdRequest = 

        Document::create([
            'name' => $httpRequest->file('file')->getClientOriginalName(),
            'path' => $path,
            'file_type' => $httpRequest->file('file')->getClientMimeType(),
            'document_type' => DocumentType::OFFER_DOCUMENT,
            'parent_id' => $offer->id,
            'parent_type' => RequestOffer::class,
            'uploader_id' => $httpRequest->user()->id,
        ]);
        return back();
    }
}

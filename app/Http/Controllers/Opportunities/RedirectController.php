<?php

declare(strict_types=1);

namespace App\Http\Controllers\Opportunities;

use App\Enums\Opportunity\Status;
use App\Events\Opportunity\OpportunityClicked;
use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Support\UrlNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RedirectController extends Controller
{
    public function __invoke(Request $request, Opportunity $opportunity): RedirectResponse
    {
        if ($opportunity->status !== Status::ACTIVE) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $raw = $opportunity->url;

        if (!is_string($raw) || trim($raw) === '') {
            abort(Response::HTTP_NOT_FOUND);
        }

        $normalized = UrlNormalizer::normalize($raw);

        if ($normalized === null || !preg_match('#^https?://#i', $normalized)) {
            Log::warning('opportunity.redirect.invalid_scheme', [
                'opportunity_id' => $opportunity->id,
                'raw_url' => $raw,
            ]);
            abort(Response::HTTP_NOT_FOUND);
        }

        event(new OpportunityClicked(
            opportunity: $opportunity,
            user: $request->user(),
            ip: $request->ip() ?? '0.0.0.0',
            userAgent: (string) $request->userAgent(),
            referer: $request->headers->get('referer'),
        ));

        return redirect()->away($normalized, Response::HTTP_FOUND)->withHeaders([
            'X-Robots-Tag' => 'noindex, nofollow',
            'Referrer-Policy' => 'no-referrer-when-downgrade',
            'Cache-Control' => 'no-store, max-age=0',
        ]);
    }
}

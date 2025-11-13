<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Request as RequestModel;
use App\Services\Actions\RequestActionProvider;
use App\Services\Request\RequestContextService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin RequestModel
 */
class RequestResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Explicitly injected context for resource transformation
     */
    private ?string $injectedContext = null;

    /**
     * Create a new resource instance.
     *
     * @param  mixed  $resource
     * @param  string|null  $context
     */
    public function __construct($resource, ?string $context = null)
    {
        parent::__construct($resource);

        if ($context !== null) {
            $this->validateContext($context);
        }

        $this->injectedContext = $context;
    }

    /**
     * Validate that the context is one of the allowed values.
     *
     * @param  string  $context
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    private function validateContext(string $context): void
    {
        $validContexts = [
            RequestContextService::CONTEXT_ADMIN,
            RequestContextService::CONTEXT_USER_OWN,
            RequestContextService::CONTEXT_PUBLIC,
            RequestContextService::CONTEXT_MATCHED,
            RequestContextService::CONTEXT_SUBSCRIBED,
        ];

        if (! in_array($context, $validContexts, true)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Invalid context "%s". Valid contexts are: %s',
                    $context,
                    implode(', ', $validContexts)
                )
            );
        }
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Eager load relationships to avoid N+1 queries
        $this->resource->loadMissing(['activeOffer', 'matchedPartner', 'user', 'offers']);
        $user = $request->user();
        $baseData = [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Relationships
            'active_offer' => $user->can('viewActiveOffer', $this->resource) ? $this->whenLoaded(('activeOffer'), function ($offer) {
                return new OfferResource($offer);
            }) : null,
            'status' => $this->whenLoaded('status'),
            'user' => $this->whenLoaded('user'),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'offers' => $this->getAuthorizedOffers($request),
            'detail' => new DetailResource($this->whenLoaded('detail')),
            'subscriptions' => $this->whenLoaded('subscriptions'),
            'subscribers' => $this->whenLoaded('subscribers'),
        ];

        // Determine context from route
        $context = $this->resolveContext($request);

        // Get available actions using simplified Action Provider Pattern
        $actionProvider = app(RequestActionProvider::class);
        $baseData['actions'] = $actionProvider->getActions(
            $this->resource,
            $request->user(),
            $context
        );

        return $baseData;
    }

    /**
     * Resolve the UI context from the current request.
     */
    private function resolveContext(Request $request): string
    {
        // Priority 1: Use explicitly injected context
        if ($this->injectedContext !== null) {
            return $this->injectedContext;
        }

        // Priority 2: Fallback to route-based resolution for backward compatibility
        return str_contains($request->route()?->getPrefix() ?? '', 'admin') ? 'admin' : 'user';
    }

    /**
     * Get offers that the current user is authorized to view.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|null
     */
    private function getAuthorizedOffers(Request $request)
    {
        if (! $this->relationLoaded('offers') || ! $request->user()?->can('viewOffers', $this->resource)) {
            return null;
        }

        return OfferResource::collection($this->whenLoaded('offers'));
    }
}

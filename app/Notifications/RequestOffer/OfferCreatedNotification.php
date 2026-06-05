<?php

declare(strict_types=1);

namespace App\Notifications\RequestOffer;

use App\Models\Request\Offer;
use App\Notifications\AbstractMandrillNotification;

/**
 * Notifies a request owner that a new offer was made on their request.
 */
class OfferCreatedNotification extends AbstractMandrillNotification
{
    public function __construct(private readonly Offer $offer)
    {
    }

    /**
     * @return array{template: string, variables: array<string, mixed>}
     */
    public function toMandrill(object $notifiable): array
    {
        return [
            'template' => 'offer.created',
            'variables' => [
                'Offer_ID' => $this->offer->id,
                'Request_Title' => $this->offer->request->capacity_development_title ?? 'N/A',
                'Request_Link' => route('request.show', $this->offer->request_id),
                'Partner_Name' => $this->offer->matchedPartner?->name ?? 'Unknown Partner',
                'user_name' => $notifiable->name,
            ] + $this->baseVariables($notifiable),
        ];
    }
}

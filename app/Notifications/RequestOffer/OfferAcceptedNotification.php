<?php

declare(strict_types=1);

namespace App\Notifications\RequestOffer;

use App\Models\Request\Offer;
use App\Models\User;
use App\Notifications\AbstractMandrillNotification;

/**
 * Notifies a recipient (admin, partner, or requester) that an offer was accepted.
 *
 * The same template is delivered to multiple audiences; the recipient's role in the
 * exchange is carried explicitly via $recipientType so overlapping recipients (e.g. an
 * admin who is also the requester) receive correctly-typed messages.
 */
class OfferAcceptedNotification extends AbstractMandrillNotification
{
    public function __construct(
        private readonly Offer $offer,
        private readonly User $acceptedBy,
        private readonly string $recipientType
    ) {
    }

    /**
     * @return array{template: string, variables: array<string, mixed>}
     */
    public function toMandrill(object $notifiable): array
    {
        return [
            'template' => 'offer.accepted',
            'variables' => [
                'Offer_ID' => $this->offer->id,
                'Request_Title' => $this->offer->request->capacity_development_title ?? 'N/A',
                'Request_Link' => route('request.public.show', $this->offer->request_id),
                'Partner_Name' => $this->offer->matchedPartner?->name ?? 'N/A',
                'Accepted_By' => $this->acceptedBy->name ?? 'N/A',
                'user_name' => $notifiable->name,
                'recipient_type' => $this->recipientType,
            ] + $this->baseVariables($notifiable),
        ];
    }
}

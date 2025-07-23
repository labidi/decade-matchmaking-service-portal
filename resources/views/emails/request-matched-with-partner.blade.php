@extends('emails.layout')

@section('content')
<h2>Hello {{ $recipient['name'] }},</h2>

@if($recipient['type'] === 'requester')
    <p>Great news! Your capacity development request has been matched with a partner.</p>
@elseif($recipient['type'] === 'partner')
    <p>Congratulations! You have been selected as a partner for a capacity development request.</p>
@endif

<div class="request-details">
    <h3>{{ $request->title }}</h3>
    
    <div class="detail-item">
        <span class="detail-label">Request ID:</span> {{ $request->id }}
    </div>
    
    @if($recipient['type'] === 'requester')
        <div class="detail-item">
            <span class="detail-label">Matched Partner:</span> {{ $partner->name }}
        </div>
        @if($partner->email)
        <div class="detail-item">
            <span class="detail-label">Partner Email:</span> {{ $partner->email }}
        </div>
        @endif
    @else
        <div class="detail-item">
            <span class="detail-label">Requester:</span> {{ $request->requester_name }}
        </div>
    @endif
    
    <div class="detail-item">
        <span class="detail-label">Match Date:</span> {{ now()->format('F j, Y \a\t g:i A') }}
    </div>
    
    @if($enhancedData['request_data']['related_activity_label'])
    <div class="detail-item">
        <span class="detail-label">Activity Type:</span> {{ $enhancedData['request_data']['related_activity_label'] }}
    </div>
    @endif
    
    @if($enhancedData['request_data']['delivery_format_label'])
    <div class="detail-item">
        <span class="detail-label">Delivery Format:</span> {{ $enhancedData['request_data']['delivery_format_label'] }}
    </div>
    @endif
    
    @if($enhancedData['request_data']['completion_date'])
    <div class="detail-item">
        <span class="detail-label">Expected Completion:</span> {{ \Carbon\Carbon::parse($enhancedData['request_data']['completion_date'])->format('F j, Y') }}
    </div>
    @endif
    
    @if(!empty($enhancedData['request_data']['subthemes_labels']))
    <div class="detail-item">
        <span class="detail-label">Sub-themes:</span>
        <ul>
            @foreach($enhancedData['request_data']['subthemes_labels'] as $subtheme)
                <li>{{ $subtheme }}</li>
            @endforeach
        </ul>
    </div>
    @endif
    
    @if($enhancedData['request_data']['gap_description'])
    <div class="detail-item">
        <span class="detail-label">Gap Description:</span>
        <p>{{ Str::limit($enhancedData['request_data']['gap_description'], 200) }}</p>
    </div>
    @endif
    
    @if($enhancedData['request_data']['expected_outcomes'])
    <div class="detail-item">
        <span class="detail-label">Expected Outcomes:</span>
        <p>{{ Str::limit($enhancedData['request_data']['expected_outcomes'], 200) }}</p>
    </div>
    @endif
</div>

@if($recipient['type'] === 'requester')
    <p>Your partner will be in touch with you soon to discuss the next steps. Please check your request details for more information about the partnership.</p>
    <p><strong>Next Steps:</strong></p>
    <ul>
        <li>Review your partner's profile and expertise</li>
        <li>Prepare for initial discussions with your partner</li>
        <li>Finalize project timelines and deliverables</li>
    </ul>
@elseif($recipient['type'] === 'partner')
    <p>Please review the request details and reach out to the requester to begin planning your collaboration.</p>
    <p><strong>Next Steps:</strong></p>
    <ul>
        <li>Review the full request requirements</li>
        <li>Contact the requester to introduce yourself</li>
        <li>Discuss project scope, timeline, and deliverables</li>
        <li>Submit your detailed partnership proposal</li>
    </ul>
@endif

<a href="{{ config('app.url') }}/requests/{{ $request->id }}" class="cta-button">
    View Full Request Details
</a>

<p>We're excited to see this partnership develop and contribute to ocean science capacity building!</p>

<p>If you have any questions about this partnership, please don't hesitate to contact our support team.</p>

<p>Best regards,<br>
{{ config('app.name') }} Team</p>
@endsection
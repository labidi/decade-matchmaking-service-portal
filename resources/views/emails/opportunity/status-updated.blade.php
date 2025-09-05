@extends('emails.layout')

@section('content')
    <h2>Dear {{ $opportunity->user->name }},</h2>

    <p>The status of your opportunity "<strong>{{ $opportunity->title }}</strong>" has been updated.</p>

    <div class="info-box">
        <h3>Status Change:</h3>
        <ul>
            <li><strong>Previous Status:</strong> {{ $previousStatus }}</li>
            <li><strong>New Status:</strong> <span class="status-{{ strtolower($newStatus) }}">{{ $newStatus }}</span></li>
            <li><strong>Updated On:</strong> {{ now()->format('F j, Y g:i A') }}</li>
        </ul>
    </div>

    @if($actionRequired)
        <div class="alert-box">
            <h4>Action Required:</h4>
            <p>{{ $actionRequired }}</p>
        </div>
    @endif

    @if($recipientType === 'creator')
        <a href="{{ $viewUrl }}" class="cta-button">
            View Your Opportunity
        </a>

        <p>If you have any questions about this status change, please don't hesitate to contact our support team.</p>
    @else
        <a href="{{ $viewUrl }}" class="cta-button">
            Review Opportunity
        </a>

        <p>This notification was sent to administrators regarding the status change of this opportunity.</p>
    @endif

    <p>Best regards,<br>
        IOC Secretariat - Ocean Decade Portal</p>
@endsection

<style>
    .status-active { color: #059669; font-weight: bold; }
    .status-rejected { color: #dc2626; font-weight: bold; }
    .status-closed { color: #6b7280; font-weight: bold; }
    .status-pending { color: #d97706; font-weight: bold; }
    
    .alert-box {
        background-color: #fef3c7;
        border: 1px solid #f59e0b;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
    }
    
    .alert-box h4 {
        margin: 0 0 10px 0;
        color: #92400e;
    }
</style>
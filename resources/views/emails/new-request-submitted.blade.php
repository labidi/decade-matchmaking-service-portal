@extends('emails.layout')

@section('content')
    <h2>Dear {{ $recipient['name'] }},</h2>

    @if($recipient['type'] === 'requester')
        <p>Thank you for submitting your request: {{$request->detail->capacity_development_title}} through the Capacity
            Development Matchmaking Platform. Your submission has been received and will be reviewed by the IOC
            Secretariat.</p>
        <p>
        <p>Sincerely,<br>
            IOC Secretariat</p>
    @elseif($recipient['type'] === 'admin')
        <p>A new capacity development request has been submitted and requires your attention.</p>
    @endif

    @if($recipient['type'] === 'requester')
        <p>If any clarifications or additional information are required, we will contact you within two weeks. Thank you
            for your engagement.</p>
        <a href="{{ route('request.show',['id'=>$request->id])}}" class="cta-button">
            Track Your Request
        </a>
    @elseif($recipient['type'] === 'admin')
        <p>Please review this request and update its status as appropriate.</p>
        <a href="{{ config('app.url') }}/admin/requests/{{ $request->id }}" class="cta-button">
            Review Request
        </a>
    @endif

    <p>If you have any questions, please don't hesitate to contact our support team.</p>

    <p>Sincerely,<br>
        IOC Secretariat</p>
@endsection

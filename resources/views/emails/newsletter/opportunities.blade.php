<ul>
    @forelse($opportunities as $opportunity)
        <li aria-level="1" dir="ltr">
            <p dir="ltr" role="presentation">
                <span style="color:#ffffff">
                    {{ $opportunity['title'] }} related to {{ $opportunity['type'] }}  is open. <br/>
                    The application deadline is {{ \Carbon\Carbon::parse($opportunity['closing_date'])->format('F j, Y') }} <br/><br/>
                    <strong id="docs-internal-guid-10a98ec6-7fff-2c8b-d9e6-bd03cb15d44b">
                         <a style="color:#D9D9D9" href="{{ config('app.url') }}/opportunities/{{ $opportunity['id'] }}">
                             Click here for more details about the opportunity
                         </a>
                 </strong>
                </span>
            </p>
        </li>
    @empty
        <p>No new opportunities match your preferences this week.</p>
    @endforelse
</ul>

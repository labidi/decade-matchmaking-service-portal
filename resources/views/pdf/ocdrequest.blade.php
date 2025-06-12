<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px; border: 1px solid #000; text-align: left; }
    </style>
</head>
<body>
    <h1>Request #{{ $ocdRequest->id }}</h1>
    <table>
        <tr>
            <th>Status</th>
            <td>{{ $ocdRequest->status->status_label }}</td>
        </tr>
        <tr>
            <th>Submitted At</th>
            <td>{{ $ocdRequest->created_at }}</td>
        </tr>
        @foreach((array) $ocdRequest->request_data as $key => $value)
            <tr>
                <th>{{ ucwords(str_replace('_', ' ', $key)) }}</th>
                <td>
                    @if(is_array($value))
                        {{ implode(', ', $value) }}
                    @else
                        {{ $value }}
                    @endif
                </td>
            </tr>
        @endforeach
    </table>
</body>
</html>

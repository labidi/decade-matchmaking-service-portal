<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

class OceanExpertSearchService
{
    /**
     * Search user data by email via OceanExpert advancedSearch
     */
    public function searchByEmail(string $email): array
    {
        $url = Config::get('services.oceanexpert.search_url');
        $response = Http::asJson()
            ->get($url, [
                'action'       => 'advSearch',
                'filter[]'     => 'Email contains',
                'keywords[]'   => $email,
            ]);
        $response->throw();
        $profile = [];
        if (isset($response['results']['data'][0])) {
            $profile['name'] = $response['results']['data'][0]['name'] ?? null;
            $profile['first_name'] = $response['results']['data'][0]['fname'] ?? null;
            $profile['last_name'] = $response['results']['data'][0]['sname'] ?? null;
            $profile['country'] = $response['results']['data'][0]['country'] ?? null;
            $profile['city'] = $response['results']['data'][0]['city'] ?? null;
        } else {
            throw new \RuntimeException('OceanExpert Profile Not found.');
        }
        return $profile;
    }
}

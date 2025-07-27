<?php

namespace Tests\Unit;

use App\Models\Request as OCDRequest;
use App\Models\Request\Status;
use App\Models\Request\Offer;
use App\Models\User;
use App\Services\OcdRequestService;
use App\Enums\RequestOfferStatus;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OcdRequestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected OcdRequestService $service;
    protected User $user;
    protected User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OcdRequestService();
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();

        // Create status records
        Status::create(['status_code' => 'draft', 'status_label' => 'Draft']);
        Status::create(['status_code' => 'under_review', 'status_label' => 'Under Review']);
        Status::create(['status_code' => 'validated', 'status_label' => 'Validated']);
        Status::create(['status_code' => 'offer_made', 'status_label' => 'Offer Made']);
        Status::create(['status_code' => 'match_made', 'status_label' => 'Match Made']);
        Status::create(['status_code' => 'in_implementation', 'status_label' => 'In Implementation']);
        Status::create(['status_code' => 'closed', 'status_label' => 'Closed']);
    }

    public function test_can_save_draft()
    {
        $data = [
            'capacity_development_title' => 'Test Training',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ];

        $request = $this->service->saveDraft($this->user, $data);

        $this->assertInstanceOf(OCDRequest::class, $request);
        $this->assertEquals($this->user->id, $request->user_id);
        $this->assertEquals('draft', $request->status->status_code);
        $this->assertEquals($data['capacity_development_title'], json_decode($request->request_data)->capacity_development_title);
    }

    public function test_can_store_request()
    {
        $data = [
            'capacity_development_title' => 'Test Training',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ];

        $request = $this->service->storeRequest($this->user, $data);

        $this->assertInstanceOf(OCDRequest::class, $request);
        $this->assertEquals($this->user->id, $request->user_id);
        $this->assertEquals('under_review', $request->status->status_code);
        $this->assertEquals($data['capacity_development_title'], json_decode($request->request_data)->capacity_development_title);
    }

    public function test_can_get_user_requests()
    {
        // Create requests for the user
        OCDRequest::factory()->count(3)->create(['user_id' => $this->user->id]);

        // Create requests for another user
        OCDRequest::factory()->count(2)->create(['user_id' => $this->otherUser->id]);

        $requests = $this->service->getUserRequests($this->user);

        $this->assertCount(3, $requests);
        $this->assertTrue($requests->every(fn($req) => $req->user_id === $this->user->id));
    }

    public function test_can_get_public_requests()
    {
        // Create public requests from other users
        OCDRequest::factory()->count(3)->create([
            'user_id' => $this->otherUser->id,
            'status_id' => Status::where('status_code', 'validated')->first()->id
        ]);

        // Create user's own requests
        OCDRequest::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'validated')->first()->id
        ]);

        $requests = $this->service->getPublicRequests($this->user);

        $this->assertCount(3, $requests);
        $this->assertTrue($requests->every(fn($req) => $req->user_id !== $this->user->id));
    }

    public function test_can_get_matched_requests()
    {
        // Create matched requests for the user
        OCDRequest::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'in_implementation')->first()->id
        ]);

        OCDRequest::factory()->count(1)->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'closed')->first()->id
        ]);

        $requests = $this->service->getMatchedRequests($this->user);

        $this->assertCount(3, $requests);
        $this->assertTrue($requests->every(fn($req) => $req->user_id === $this->user->id));
    }

    public function test_can_find_request_with_authorization()
    {
        $request = OCDRequest::factory()->create(['user_id' => $this->user->id]);

        $found = $this->service->findRequest($request->id, $this->user);

        $this->assertEquals($request->id, $found->id);
    }

    public function test_cannot_find_nonexistent_request()
    {
        $found = $this->service->findRequest(999, $this->user);

        $this->assertNull($found);
    }

    public function test_can_update_request_status()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'draft')->first()->id
        ]);

        $result = $this->service->updateRequestStatus($request->id, 'validated', $this->user);

        $this->assertEquals('validated', $result['request']->status->status_code);
        $this->assertEquals('Validated', $result['status']['status_label']);
    }

    public function test_cannot_update_request_status_without_ownership()
    {
        $request = OCDRequest::factory()->create(['user_id' => $this->otherUser->id]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Unauthorized to update this request');

        $this->service->updateRequestStatus($request->id, 'validated', $this->user);
    }

    public function test_can_delete_draft_request()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'draft')->first()->id
        ]);

        $deleted = $this->service->deleteRequest($request->id, $this->user);

        $this->assertTrue($deleted);
        $this->assertDatabaseMissing('requests', ['id' => $request->id]);
    }

    public function test_cannot_delete_non_draft_request()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'validated')->first()->id
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Only draft requests can be deleted');

        $this->service->deleteRequest($request->id, $this->user);
    }

    public function test_can_get_active_offer()
    {
        $request = OCDRequest::factory()->create();
        $offer = Offer::factory()->create([
            'request_id' => $request->id,
            'status' => RequestOfferStatus::ACTIVE
        ]);

        $foundOffer = $this->service->getActiveOffer($request->id);

        $this->assertEquals($offer->id, $foundOffer->id);
    }

    public function test_returns_null_for_no_active_offer()
    {
        $request = OCDRequest::factory()->create();

        $foundOffer = $this->service->getActiveOffer($request->id);

        $this->assertNull($foundOffer);
    }

    public function test_can_get_request_stats()
    {
        // Create requests with different statuses
        OCDRequest::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'draft')->first()->id
        ]);

        OCDRequest::factory()->count(1)->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'validated')->first()->id
        ]);

        $stats = $this->service->getRequestStats($this->user);

        $this->assertEquals(3, $stats['total']);
        $this->assertEquals(2, $stats['draft']);
        $this->assertEquals(1, $stats['validated']);
    }

    public function test_can_search_requests_with_filters()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'request_data' => json_encode([
                'related_activity' => 'Training',
                'subthemes' => ['Ocean Science']
            ])
        ]);

        $filters = ['activity_type' => 'Training'];
        $results = $this->service->searchRequests($filters, $this->user);

        $this->assertCount(1, $results);
        $this->assertEquals($request->id, $results->first()->id);
    }

    public function test_can_get_request_actions()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => Status::where('status_code', 'draft')->first()->id
        ]);

        $actions = $this->service->getRequestActions($request, $this->user);

        $this->assertTrue($actions['canEdit']);
        $this->assertTrue($actions['canDelete']);
        $this->assertFalse($actions['canExpressInterest']);
    }

    public function test_can_get_request_title()
    {
        $request = OCDRequest::factory()->create([
            'request_data' => json_encode(['capacity_development_title' => 'Test Training'])
        ]);

        $title = $this->service->getRequestTitle($request);

        $this->assertEquals('Test Training', $title);
    }

    public function test_returns_na_for_missing_title()
    {
        $request = OCDRequest::factory()->create([
            'request_data' => json_encode([])
        ]);

        $title = $this->service->getRequestTitle($request);

        $this->assertEquals('N/A', $title);
    }

    public function test_can_get_request_for_export()
    {
        $request = OCDRequest::factory()->create(['user_id' => $this->user->id]);

        $exportRequest = $this->service->getRequestForExport($request->id, $this->user);

        $this->assertEquals($request->id, $exportRequest->id);
    }

    public function test_cannot_export_other_users_request()
    {
        $request = OCDRequest::factory()->create(['user_id' => $this->otherUser->id]);

        $exportRequest = $this->service->getRequestForExport($request->id, $this->user);

        $this->assertNull($exportRequest);
    }
}

<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\RequestService;
use App\Models\Request as OCDRequest;
use App\Models\User;
use App\Models\Request\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Schema;

class RequestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected RequestService $service;
    protected User $user;
    protected Status $draftStatus;
    protected Status $validatedStatus;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new RequestService();

        // Create test user
        $this->user = User::factory()->create();

        // Create statuses
        $this->draftStatus = Status::create([
            'status_code' => 'draft',
            'status_label' => 'Draft',
            'description' => 'Request is in draft status'
        ]);

        $this->validatedStatus = Status::create([
            'status_code' => 'validated',
            'status_label' => 'Validated',
            'description' => 'Request has been validated'
        ]);
    }

    /** @test */
    public function it_stores_request_successfully()
    {
        $data = $this->getSampleRequestData();

        $request = $this->service->storeRequest($this->user, $data);

        $this->assertInstanceOf(OCDRequest::class, $request);
        $this->assertEquals($this->user->id, $request->user_id);
        $this->assertEquals($this->validatedStatus->id, $request->status_id);
        $this->assertNotNull($request->request_data);

        // Check if normalized data was created (if tables exist)
        if (Schema::hasTable('request_details')) {
            $this->assertNotNull($request->detail);
            $this->assertEquals(['ocean_health', 'sustainable_fisheries'], $request->detail->subthemes);
            $this->assertEquals(['technical_support', 'capacity_building'], $request->detail->support_types);
            $this->assertEquals(['researchers', 'policy_makers'], $request->detail->target_audience);
        }
    }

    /** @test */
    public function it_saves_draft_successfully()
    {
        $data = $this->getSampleRequestData();

        $request = $this->service->saveDraft($this->user, $data);

        $this->assertInstanceOf(OCDRequest::class, $request);
        $this->assertEquals($this->user->id, $request->user_id);
        $this->assertEquals($this->draftStatus->id, $request->status_id);
    }

    /** @test */
    public function it_gets_user_requests()
    {
        OCDRequest::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'status_id' => $this->validatedStatus->id,
        ]);

        $requests = $this->service->getUserRequests($this->user);

        $this->assertInstanceOf(Collection::class, $requests);
        $this->assertCount(3, $requests);

        foreach ($requests as $request) {
            $this->assertEquals($this->user->id, $request->user_id);
        }
    }

    /** @test */
    public function it_gets_public_requests()
    {
        $otherUser = User::factory()->create();

        OCDRequest::factory()->count(2)->create([
            'user_id' => $otherUser->id,
            'status_id' => $this->validatedStatus->id,
        ]);

        OCDRequest::factory()->create([
            'user_id' => $otherUser->id,
            'status_id' => $this->draftStatus->id, // Private
        ]);

        $requests = $this->service->getPublicRequests($this->user);

        $this->assertInstanceOf(Collection::class, $requests);
        $this->assertCount(2, $requests);

        foreach ($requests as $request) {
            $this->assertNotEquals($this->user->id, $request->user_id);
        }
    }

    /** @test */
    public function it_finds_request_with_authorization()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => $this->validatedStatus->id,
        ]);

        $found = $this->service->findRequest($request->id, $this->user);

        $this->assertInstanceOf(OCDRequest::class, $found);
        $this->assertEquals($request->id, $found->id);
    }

    /** @test */
    public function it_returns_null_for_unauthorized_request()
    {
        $otherUser = User::factory()->create();
        $request = OCDRequest::factory()->create([
            'user_id' => $otherUser->id,
            'status_id' => $this->draftStatus->id, // Private
        ]);

        $found = $this->service->findRequest($request->id, $this->user);

        $this->assertNull($found);
    }

    /** @test */
    public function it_updates_request_status()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $result = $this->service->updateRequestStatus($request->id, 'validated', $this->user);

        $this->assertTrue($result['success']);
        $this->assertEquals('Request status updated successfully', $result['message']);

        $request->refresh();
        $this->assertEquals($this->validatedStatus->id, $request->status_id);
    }

    /** @test */
    public function it_throws_exception_for_unauthorized_status_update()
    {
        $otherUser = User::factory()->create();
        $request = OCDRequest::factory()->create([
            'user_id' => $otherUser->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Unauthorized to update this request');

        $this->service->updateRequestStatus($request->id, 'validated', $this->user);
    }

    /** @test */
    public function it_deletes_request_successfully()
    {
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $result = $this->service->deleteRequest($request->id, $this->user);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('requests', ['id' => $request->id]);
    }

    /** @test */
    public function it_throws_exception_for_unauthorized_deletion()
    {
        $otherUser = User::factory()->create();
        $request = OCDRequest::factory()->create([
            'user_id' => $otherUser->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Unauthorized to delete this request');

        $this->service->deleteRequest($request->id, $this->user);
    }

    /** @test */
    public function it_gets_request_statistics()
    {
        OCDRequest::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status_id' => $this->draftStatus->id,
        ]);

        OCDRequest::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'status_id' => $this->validatedStatus->id,
        ]);

        $stats = $this->service->getRequestStats($this->user);

        $this->assertIsArray($stats);
        $this->assertEquals(5, $stats['total']);
        $this->assertEquals(2, $stats['draft']);
        $this->assertEquals(3, $stats['validated']);
    }

    /** @test */
    public function it_gets_request_title()
    {
        $data = $this->getSampleRequestData();
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'request_data' => json_encode($data),
        ]);

        $title = $this->service->getRequestTitle($request);

        $this->assertEquals('Ocean Conservation Workshop', $title);
    }

    /** @test */
    public function it_gets_requester_name()
    {
        $data = $this->getSampleRequestData();
        $request = OCDRequest::factory()->create([
            'user_id' => $this->user->id,
            'request_data' => json_encode($data),
        ]);

        $name = $this->service->getRequesterName($request);

        $this->assertEquals('John Doe', $name);
    }

    /** @test */
    public function it_saves_json_arrays_in_request_details()
    {
        $data = $this->getSampleRequestData();

        $request = $this->service->storeRequest($this->user, $data);

        if (Schema::hasTable('request_details')) {
            $this->assertNotNull($request->detail);

            // Check JSON arrays are saved correctly
            $this->assertIsArray($request->detail->subthemes);
            $this->assertIsArray($request->detail->support_types);
            $this->assertIsArray($request->detail->target_audience);

            // Check specific values
            $this->assertContains('ocean_health', $request->detail->subthemes);
            $this->assertContains('sustainable_fisheries', $request->detail->subthemes);
            $this->assertContains('technical_support', $request->detail->support_types);
            $this->assertContains('capacity_building', $request->detail->support_types);
            $this->assertContains('researchers', $request->detail->target_audience);
            $this->assertContains('policy_makers', $request->detail->target_audience);
        }
    }

    /**
     * Get sample request data for testing
     */
    private function getSampleRequestData(): array
    {
        return [
            'capacity_development_title' => 'Ocean Conservation Workshop',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'related_activity' => 'training',
            'gap_description' => 'Need training on ocean conservation practices',
            'expected_outcomes' => 'Improved understanding of marine ecosystems',
            'subthemes' => ['ocean_health', 'sustainable_fisheries'],
            'support_types' => ['technical_support', 'capacity_building'],
            'target_audience' => ['researchers', 'policy_makers'],
            'delivery_country' => 'Belgium',
            'budget_breakdown' => '5000 EUR for materials and travel',
            'completion_date' => '2024-12-31',
        ];
    }
}

<?php

namespace Tests\Unit;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use App\Services\OpportunityService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityServiceTest extends TestCase
{
    use RefreshDatabase;

    protected OpportunityService $opportunityService;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->opportunityService = new OpportunityService();
        $this->user = User::factory()->create();
    }

    public function test_can_create_opportunity()
    {
        $data = [
            'title' => 'Test Opportunity',
            'type' => 'training',
            'closing_date' => '2024-12-31',
            'coverage_activity' => 'Ocean Science Training',
            'implementation_location' => 'Global',
            'target_audience' => 'Researchers',
            'summary' => 'A test opportunity for ocean science training',
            'url' => 'https://example.com',
        ];

        $opportunity = $this->opportunityService->createOpportunity($data, $this->user);

        $this->assertInstanceOf(Opportunity::class, $opportunity);
        $this->assertEquals($data['title'], $opportunity->title);
        $this->assertEquals($this->user->id, $opportunity->user_id);
        $this->assertEquals(OpportunityStatus::PENDING_REVIEW, $opportunity->status);
    }

    public function test_can_get_user_opportunities()
    {
        // Create opportunities for the user
        Opportunity::factory()->count(3)->create(['user_id' => $this->user->id]);
        
        // Create opportunities for another user
        Opportunity::factory()->count(2)->create();

        $opportunities = $this->opportunityService->getUserOpportunities($this->user);

        $this->assertCount(3, $opportunities);
        $this->assertTrue($opportunities->every(fn($opp) => $opp->user_id === $this->user->id));
    }

    public function test_can_get_public_opportunities()
    {
        // Create active opportunities from other users
        Opportunity::factory()->count(3)->create([
            'user_id' => User::factory()->create()->id,
            'status' => OpportunityStatus::ACTIVE
        ]);
        
        // Create user's own opportunities
        Opportunity::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::ACTIVE
        ]);

        $opportunities = $this->opportunityService->getPublicOpportunities($this->user);

        $this->assertCount(3, $opportunities);
        $this->assertTrue($opportunities->every(fn($opp) => $opp->user_id !== $this->user->id));
        $this->assertTrue($opportunities->every(fn($opp) => $opp->status === OpportunityStatus::ACTIVE));
    }

    public function test_can_find_opportunity_with_authorization()
    {
        $opportunity = Opportunity::factory()->create(['user_id' => $this->user->id]);
        
        $found = $this->opportunityService->findOpportunity($opportunity->id, $this->user);
        
        $this->assertEquals($opportunity->id, $found->id);
    }

    public function test_cannot_find_nonexistent_opportunity()
    {
        $found = $this->opportunityService->findOpportunity(999, $this->user);
        
        $this->assertNull($found);
    }

    public function test_can_update_opportunity_status()
    {
        $opportunity = Opportunity::factory()->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::PENDING_REVIEW
        ]);

        $result = $this->opportunityService->updateOpportunityStatus(
            $opportunity->id, 
            OpportunityStatus::ACTIVE->value, 
            $this->user
        );

        $this->assertEquals(OpportunityStatus::ACTIVE->value, $result['opportunity']->status);
        $this->assertEquals('Active', $result['status']['status_label']);
    }

    public function test_cannot_update_opportunity_status_without_ownership()
    {
        $otherUser = User::factory()->create();
        $opportunity = Opportunity::factory()->create(['user_id' => $otherUser->id]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Unauthorized to update this opportunity');

        $this->opportunityService->updateOpportunityStatus(
            $opportunity->id, 
            OpportunityStatus::ACTIVE->value, 
            $this->user
        );
    }

    public function test_can_delete_pending_opportunity()
    {
        $opportunity = Opportunity::factory()->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::PENDING_REVIEW
        ]);

        $deleted = $this->opportunityService->deleteOpportunity($opportunity->id, $this->user);

        $this->assertTrue($deleted);
        $this->assertDatabaseMissing('opportunities', ['id' => $opportunity->id]);
    }

    public function test_cannot_delete_active_opportunity()
    {
        $opportunity = Opportunity::factory()->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::ACTIVE
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Only pending review opportunities can be deleted');

        $this->opportunityService->deleteOpportunity($opportunity->id, $this->user);
    }

    public function test_can_get_opportunity_stats()
    {
        // Create opportunities with different statuses
        Opportunity::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::ACTIVE
        ]);
        Opportunity::factory()->count(1)->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::PENDING_REVIEW
        ]);
        Opportunity::factory()->count(1)->create([
            'user_id' => $this->user->id,
            'status' => OpportunityStatus::CLOSED
        ]);

        $stats = $this->opportunityService->getOpportunityStats($this->user);

        $this->assertEquals(4, $stats['total']);
        $this->assertEquals(2, $stats['active']);
        $this->assertEquals(1, $stats['pending']);
        $this->assertEquals(1, $stats['closed']);
    }

    public function test_can_search_opportunities_with_filters()
    {
        Opportunity::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'training',
            'implementation_location' => 'Europe'
        ]);
        
        Opportunity::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'fellowships',
            'implementation_location' => 'Asia'
        ]);

        $filters = ['type' => 'training', 'location' => 'Europe'];
        $results = $this->opportunityService->searchOpportunities($filters, $this->user);

        $this->assertCount(1, $results);
        $this->assertEquals('training', $results->first()->type);
    }
} 
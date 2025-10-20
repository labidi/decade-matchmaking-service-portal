<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\Opportunity\Status;
use App\Enums\Opportunity\Type;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Opportunity>
 */
class OpportunityFactory extends Factory
{
    protected $model = Opportunity::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(Type::cases()),
            'status' => Status::ACTIVE,
            'closing_date' => $this->faker->dateTimeBetween('+1 week', '+3 months'),
            'summary' => $this->faker->paragraph(),
            'url' => $this->faker->url(),
            'user_id' => User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the opportunity is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Status::ACTIVE,
        ]);
    }

    /**
     * Indicate that the opportunity is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Status::CLOSED,
        ]);
    }

    /**
     * Indicate that the opportunity is of a specific type.
     */
    public function ofType(Type|string $type): static
    {
        $typeEnum = is_string($type) ? Type::tryFrom($type) : $type;

        return $this->state(fn (array $attributes) => [
            'type' => $typeEnum ?? Type::TRAINING,
        ]);
    }
}
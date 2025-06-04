<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        schema::table('opportunities', function (Blueprint $table) {	
            $table->unsignedTinyInteger('status')->nullable(false)->default(1)->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        schema::table('opportunities', function (Blueprint $table) {	
            $table->dropColumn('status');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function () {
            DB::table('users')
                ->where('role', 'admin')
                ->update([
                    'faculty_id' => null,
                    'updated_at' => now(),
                ]);

            DB::table('faculties')
                ->where('code', 'admin')
                ->delete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            $faculty = DB::table('faculties')->where('code', 'admin')->first();

            if (!$faculty) {
                $id = DB::table('faculties')->insertGetId([
                    'code' => 'admin',
                    'name' => 'Administrator',
                    'sort_order' => 0,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $id = $faculty->id;
            }

            DB::table('users')
                ->where('role', 'admin')
                ->update([
                    'faculty_id' => $id,
                    'updated_at' => now(),
                ]);
        });
    }
};

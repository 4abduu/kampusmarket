<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel referensi untuk fakultas (3NF)
     * Sebelumnya: faculty disimpan sebagai string di tabel users
     * Sekarang: faculty_id sebagai foreign key ke tabel ini
     */
    public function up(): void
    {
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // 'vokasi', 'feb', 'filkom', etc.
            $table->string('name'); // 'Fakultas Vokasi', 'Fakultas Ekonomi dan Bisnis', etc.
            $table->string('icon')->nullable(); // Emoji icon
            $table->string('color')->nullable(); // Tailwind color class
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        // Seed initial data
        $faculties = [
            ['code' => 'vokasi', 'name' => 'Fakultas Vokasi', 'icon' => '🔧', 'color' => 'bg-blue-500', 'sort_order' => 1],
            ['code' => 'feb', 'name' => 'Fakultas Ekonomi dan Bisnis (FEB)', 'icon' => '📊', 'color' => 'bg-emerald-500', 'sort_order' => 2],
            ['code' => 'filkom', 'name' => 'Fakultas Ilmu Komputer (FILKOM)', 'icon' => '💻', 'color' => 'bg-purple-500', 'sort_order' => 3],
            ['code' => 'ft', 'name' => 'Fakultas Teknik (FT)', 'icon' => '⚙️', 'color' => 'bg-orange-500', 'sort_order' => 4],
            ['code' => 'fmipa', 'name' => 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)', 'icon' => '🔬', 'color' => 'bg-cyan-500', 'sort_order' => 5],
            ['code' => 'fisip', 'name' => 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)', 'icon' => '🏛️', 'color' => 'bg-red-500', 'sort_order' => 6],
            ['code' => 'fh', 'name' => 'Fakultas Hukum (FH)', 'icon' => '⚖️', 'color' => 'bg-yellow-500', 'sort_order' => 7],
            ['code' => 'fk', 'name' => 'Fakultas Kedokteran (FK)', 'icon' => '🏥', 'color' => 'bg-pink-500', 'sort_order' => 8],
            ['code' => 'fkh', 'name' => 'Fakultas Kedokteran Hewan (FKH)', 'icon' => '🐾', 'color' => 'bg-teal-500', 'sort_order' => 9],
            ['code' => 'fapet', 'name' => 'Fakultas Peternakan (FAPET)', 'icon' => '🐄', 'color' => 'bg-amber-500', 'sort_order' => 10],
            ['code' => 'fp', 'name' => 'Fakultas Pertanian (FP)', 'icon' => '🌾', 'color' => 'bg-lime-500', 'sort_order' => 11],
            ['code' => 'fpi', 'name' => 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)', 'icon' => '🐟', 'color' => 'bg-sky-500', 'sort_order' => 12],
            ['code' => 'fib', 'name' => 'Fakultas Ilmu Budaya (FIB)', 'icon' => '📚', 'color' => 'bg-rose-500', 'sort_order' => 13],
            ['code' => 'psdku', 'name' => 'PSDKU', 'icon' => '🎓', 'color' => 'bg-slate-500', 'sort_order' => 14],
            ['code' => 'alumni', 'name' => 'Alumni', 'icon' => '👨‍🎓', 'color' => 'bg-indigo-500', 'sort_order' => 15],
            ['code' => 'masyarakat', 'name' => 'Masyarakat Umum', 'icon' => '👥', 'color' => 'bg-gray-500', 'sort_order' => 16],
            ['code' => 'lainnya', 'name' => 'Lainnya', 'icon' => '❓', 'color' => 'bg-neutral-500', 'sort_order' => 17],
        ];

        foreach ($faculties as $faculty) {
            DB::table('faculties')->insert([
                'code' => $faculty['code'],
                'name' => $faculty['name'],
                'icon' => $faculty['icon'],
                'color' => $faculty['color'],
                'sort_order' => $faculty['sort_order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculties');
    }
};

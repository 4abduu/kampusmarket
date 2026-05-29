<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Faculty
 */
class FacultyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->code,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'sortOrder' => $this->sort_order,
            'isActive' => $this->is_active,
            'studentCount' => $this->users_count ?? $this->users()->count(),
        ];
    }

    /**
     * Get minimal faculty data (for dropdowns).
     */
    public function toMinimalArray(): array
    {
        return [
            'id' => $this->code,
            'name' => $this->name,
        ];
    }
}

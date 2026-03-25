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
            'name' => $this->name,
            'icon' => $this->icon,
            'color' => $this->color,
            'sortOrder' => $this->sort_order,
            'isActive' => $this->is_active,
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

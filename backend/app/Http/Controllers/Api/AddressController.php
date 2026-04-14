<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Http\Resources\AddressResource;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;

class AddressController extends Controller
{
    /**
     * Display a listing of addresses.
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = Address::with(['user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => AddressResource::collection($addresses),
        ]);
    }

    /**
     * Store a newly created address.
     */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        $user = $request->user();

        // If this is first address, make it primary
        $isPrimary = $request->is_primary ?? ($user->addresses()->count() === 0);

        // If setting as primary, remove primary from others
        if ($isPrimary) {
            $user->addresses()->update(['is_primary' => false]);
        }

        $address = Address::create([
            'uuid' => NumberGenerator::uuid(),
            'user_id' => $user->id,
            'label' => $request->label,
            'recipient' => $request->recipient,
            'phone' => $request->phone,
            'address' => $request->address,
            'notes' => $request->notes,
            'is_primary' => $isPrimary,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil ditambahkan',
            'data' => new AddressResource($address),
        ], 201);
    }

    /**
     * Display the specified address.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $address = Address::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new AddressResource($address),
        ]);
    }

    /**
     * Update the specified address.
     */
    public function update(UpdateAddressRequest $request, string $id): JsonResponse
    {
        $address = Address::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $data = $request->validated();

        // If setting as primary, remove primary from others
        if ($request->has('is_primary') && $request->is_primary) {
            $request->user()->addresses()
                ->where('id', '!=', $address->id)
                ->update(['is_primary' => false]);
        }

        $address->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil diperbarui',
            'data' => new AddressResource($address->fresh()),
        ]);
    }

    /**
     * Remove the specified address.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $address = Address::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $wasPrimary = $address->is_primary;
        $address->delete();

        // If deleted address was primary, set another as primary
        if ($wasPrimary) {
            $newPrimary = $request->user()->addresses()->first();
            if ($newPrimary) {
                $newPrimary->update(['is_primary' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus',
        ]);
    }

    /**
     * Set address as primary.
     */
    public function setPrimary(string $id, Request $request): JsonResponse
    {
        $address = Address::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $address->setAsPrimary();

        return response()->json([
            'success' => true,
            'message' => 'Alamat utama berhasil diubah',
            'data' => new AddressResource($address->fresh()),
        ]);
    }

    /**
     * Get primary address.
     */
    public function primary(Request $request): JsonResponse
    {
        $address = $request->user()->primaryAddress();

        if (!$address) {
            return response()->json([
                'success' => true,
                'data' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new AddressResource($address),
        ]);
    }
}

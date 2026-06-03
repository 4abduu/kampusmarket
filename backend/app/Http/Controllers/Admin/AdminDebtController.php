<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CodInvoice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDebtController extends Controller
{
    /**
     * Get a paginated list of debts across all users.
     * Can filter by status (unpaid, paid, overdue).
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = CodInvoice::with(['user:id,name,email,uuid,phone', 'order:id,order_number,uuid'])
            ->orderBy('created_at', 'desc');

        if ($status === 'overdue') {
            $query->where('status', 'unpaid')
                  ->whereNotNull('due_date')
                  ->where('due_date', '<', now());
        } elseif ($status === 'unpaid') {
            $query->where('status', 'unpaid');
        } elseif ($status === 'paid') {
            $query->where('status', 'paid');
        }

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            })->orWhereHas('order', function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%");
            });
        }

        $debts = $query->paginate($request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => collect($debts->items())->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'uuid' => $invoice->uuid,
                    'user' => [
                        'id' => $invoice->user->id,
                        'name' => $invoice->user->name,
                        'email' => $invoice->user->email,
                        'phone' => $invoice->user->phone,
                    ],
                    'order' => $invoice->order ? [
                        'id' => $invoice->order->id,
                        'order_number' => $invoice->order->order_number,
                    ] : null,
                    'amount' => $invoice->amount,
                    'status' => $invoice->status,
                    'due_date' => $invoice->due_date,
                    'paid_at' => $invoice->paid_at,
                    'created_at' => $invoice->created_at,
                ];
            }),
            'meta' => [
                'current_page' => $debts->currentPage(),
                'last_page' => $debts->lastPage(),
                'per_page' => $debts->perPage(),
                'total' => $debts->total(),
            ],
        ]);
    }

    /**
     * Get aggregate statistics for admin dashboard
     */
    public function stats()
    {
        $totalUnpaid = CodInvoice::where('status', 'unpaid')->sum('amount');
        $totalOverdue = CodInvoice::where('status', 'unpaid')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->sum('amount');
        
        $countUnpaid = CodInvoice::where('status', 'unpaid')->count();
        $countOverdue = CodInvoice::where('status', 'unpaid')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_unpaid_amount' => (int) $totalUnpaid,
                'total_overdue_amount' => (int) $totalOverdue,
                'count_unpaid' => $countUnpaid,
                'count_overdue' => $countOverdue,
            ],
        ]);
    }
}

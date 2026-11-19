<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogController extends Controller
{
    /**
     * Display a paginated listing of system audit trail entries.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 25), 100);

        $query = AuditLog::query()
            ->with(['user:id,name,email,role'])
            ->when($request->filled('user_id'), function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            })
            ->when($request->filled('action'), function ($q) use ($request) {
                $q->where('action', 'LIKE', "%{$request->action}%");
            })
            ->when($request->filled('auditable_type'), function ($q) use ($request) {
                $q->where('auditable_type', 'LIKE', "%{$request->auditable_type}%");
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->search;
                $q->where(function ($sub) use ($term) {
                    $sub->where('action', 'LIKE', "%{$term}%")
                        ->orWhere('ip_address', 'LIKE', "%{$term}%")
                        ->orWhereHas('user', function ($u) use ($term) {
                            $u->where('name', 'LIKE', "%{$term}%")
                              ->orWhere('email', 'LIKE', "%{$term}%");
                        });
                });
            });

        $logs = $query->latest('id')->paginate($perPage);

        return $this->sendResponse($logs, 'Audit logs retrieved successfully.');
    }

    /**
     * Display the specified audit log entry.
     */
    public function show(int $id): JsonResponse
    {
        $log = AuditLog::with(['user:id,name,email,role', 'auditable'])->find($id);

        if (!$log) {
            return $this->sendError('Audit log entry not found.', [], Response::HTTP_NOT_FOUND);
        }

        return $this->sendResponse($log, 'Audit log entry retrieved successfully.');
    }
}

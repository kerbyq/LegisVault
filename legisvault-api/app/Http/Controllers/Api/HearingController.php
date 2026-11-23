<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hearing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HearingController extends Controller
{
    /**
     * List scheduled legislative hearings & council sessions with optional month/type/status filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Hearing::with([
            'committee:id,name',
            'document:id,ordinance_number,title,reading_status',
            'creator:id,name',
        ]);

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('month')) {
            $query->where('hearing_date', 'LIKE', $request->input('month') . '%');
        }

        $hearings = $query->orderBy('hearing_date', 'asc')->orderBy('start_time', 'asc')->get();

        return $this->sendResponse($hearings, 'Legislative hearing calendar retrieved successfully.');
    }

    /**
     * Schedule a new legislative hearing or plenary session (Admin & Uploader).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hearing_code' => 'required|string|max:50|unique:hearings,hearing_code',
            'title' => 'required|string|max:255',
            'type' => 'required|in:regular_session,public_hearing,committee_hearing',
            'hearing_date' => 'required|date',
            'start_time' => 'required|string|max:20',
            'venue' => 'required|string|max:255',
            'committee_id' => 'nullable|exists:committees,id',
            'document_id' => 'nullable|exists:documents,id',
            'presiding_officer' => 'nullable|string|max:255',
            'status' => 'nullable|in:scheduled,in_session,completed,deferred',
            'agenda_count' => 'nullable|integer|min:1|max:100',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'scheduled';

        $hearing = Hearing::create($validated);
        $hearing->load(['committee:id,name', 'document:id,ordinance_number,title,reading_status']);

        return $this->sendResponse($hearing, 'Legislative hearing scheduled successfully.', Response::HTTP_CREATED);
    }

    /**
     * Update hearing schedule details or tracking status.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $hearing = Hearing::find($id);
        if (!$hearing) {
            return $this->sendError('Hearing record not found.', [], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:regular_session,public_hearing,committee_hearing',
            'hearing_date' => 'sometimes|date',
            'start_time' => 'sometimes|string|max:20',
            'venue' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:scheduled,in_session,completed,deferred',
            'notes' => 'nullable|string',
        ]);

        $hearing->update($validated);
        return $this->sendResponse($hearing->fresh(['committee:id,name', 'document:id,ordinance_number,reading_status']), 'Hearing updated successfully.');
    }

    /**
     * Cancel / soft-delete a scheduled hearing (Admin only).
     */
    public function destroy(int $id): JsonResponse
    {
        $hearing = Hearing::find($id);
        if (!$hearing) {
            return $this->sendError('Hearing record not found.', [], Response::HTTP_NOT_FOUND);
        }

        $hearing->delete();
        return $this->sendResponse([], 'Hearing removed from calendar.');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Committee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CommitteeController extends Controller
{
    /**
     * Display a listing of legislative committees.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Committee::query()
            ->withCount('documents')
            ->search($request->input('search'));

        $committees = $query->orderBy('name', 'asc')->get();

        return $this->sendResponse($committees, 'Committees retrieved successfully.');
    }

    /**
     * Store a newly created committee.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:committees,name'],
            'description' => ['nullable', 'string'],
            'chairperson' => ['nullable', 'string', 'max:255'],
        ]);

        $committee = Committee::create($validated);

        AuditLog::log(
            action: 'COMMITTEE_CREATED',
            model: $committee,
            newValues: $committee->toArray(),
            userId: $request->user()->id
        );

        return $this->sendResponse($committee, 'Committee created successfully.', Response::HTTP_CREATED);
    }

    /**
     * Display the specified committee with related documents summary.
     */
    public function show(int $id): JsonResponse
    {
        $committee = Committee::withCount('documents')
            ->with(['documents' => function ($q) {
                $q->latest()->limit(10);
            }])
            ->find($id);

        if (!$committee) {
            return $this->sendError('Committee not found.', [], Response::HTTP_NOT_FOUND);
        }

        return $this->sendResponse($committee, 'Committee retrieved successfully.');
    }

    /**
     * Update the specified committee.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $committee = Committee::find($id);

        if (!$committee) {
            return $this->sendError('Committee not found.', [], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', "unique:committees,name,{$id}"],
            'description' => ['nullable', 'string'],
            'chairperson' => ['nullable', 'string', 'max:255'],
        ]);

        $old = $committee->toArray();
        $committee->update($validated);

        AuditLog::log(
            action: 'COMMITTEE_UPDATED',
            model: $committee,
            oldValues: $old,
            newValues: $committee->toArray(),
            userId: $request->user()->id
        );

        return $this->sendResponse($committee, 'Committee updated successfully.');
    }

    /**
     * Remove the specified committee.
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $committee = Committee::withCount('documents')->find($id);

        if (!$committee) {
            return $this->sendError('Committee not found.', [], Response::HTTP_NOT_FOUND);
        }

        if ($committee->documents_count > 0) {
            return $this->sendError(
                "Cannot delete committee. It is linked to {$committee->documents_count} active documents.",
                ['committee' => ['Reassign or archive documents prior to deleting this committee.']],
                Response::HTTP_CONFLICT
            );
        }

        AuditLog::log(
            action: 'COMMITTEE_DELETED',
            model: $committee,
            oldValues: ['name' => $committee->name],
            userId: $request->user()->id
        );

        $committee->delete();

        return $this->sendResponse(null, 'Committee deleted successfully.');
    }
}

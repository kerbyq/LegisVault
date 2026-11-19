<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdvanceStageRequest;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\ReadingStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class WorkflowController extends Controller
{
    /**
     * Map of stage progression sequence.
     *
     * @var array<string, int>
     */
    protected array $stageOrder = [
        'draft_received' => 1,
        'calendared' => 2,
        'first_reading' => 3,
        'second_reading' => 4,
        'third_reading_approval' => 5,
    ];

    /**
     * Advance a legislative document through reading stages.
     */
    public function advanceStage(AdvanceStageRequest $request, int $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return $this->sendError('Document not found.', [], Response::HTTP_NOT_FOUND);
        }

        $newStage = $request->validated('stage');
        $notes = $request->validated('notes');
        $transitionedAt = $request->validated('transitioned_at') ?? now();
        $user = $request->user();

        $currentStageOrder = $this->stageOrder[$document->reading_status] ?? 0;
        $newStageOrder = $this->stageOrder[$newStage] ?? 0;

        // Warn/validate if trying to advance backwards or repeat unless explicitly allowed
        if ($newStageOrder < $currentStageOrder) {
            return $this->sendError(
                "Cannot revert stage from '{$document->reading_status}' to '{$newStage}'. Stages must progress forward.",
                ['stage' => ['Stage progression must move forward through the legislative workflow.']],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        DB::beginTransaction();
        try {
            $oldStage = $document->reading_status;

            // Record the transition in reading_stages history
            $stageRecord = ReadingStage::create([
                'document_id' => $document->id,
                'stage' => $newStage,
                'transitioned_by' => $user->id,
                'notes' => $notes,
                'transitioned_at' => $transitionedAt,
            ]);

            // Update the document's current status
            $document->reading_status = $newStage;

            // If entering third_reading_approval, record the approving user
            if ($newStage === 'third_reading_approval') {
                $document->approved_by = $user->id;
            }

            $document->save();

            AuditLog::log(
                action: 'DOCUMENT_STAGE_TRANSITIONED',
                model: $document,
                oldValues: ['reading_status' => $oldStage],
                newValues: [
                    'reading_status' => $newStage,
                    'transitioned_by' => $user->id,
                    'notes' => $notes,
                ],
                userId: $user->id
            );

            DB::commit();

            $stageRecord->load('transitioner:id,name,email');

            return $this->sendResponse([
                'document' => [
                    'id' => $document->id,
                    'ordinance_number' => $document->ordinance_number,
                    'title' => $document->title,
                    'reading_status' => $document->reading_status,
                    'approved_by' => $document->approved_by,
                ],
                'transition' => $stageRecord,
            ], "Document successfully advanced to '{$newStage}'.");
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->sendError('Failed to transition document stage.', ['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieve the complete chronological reading history for a document.
     */
    public function getHistory(int $id): JsonResponse
    {
        $document = Document::select('id', 'ordinance_number', 'title', 'reading_status')->find($id);

        if (!$document) {
            return $this->sendError('Document not found.', [], Response::HTTP_NOT_FOUND);
        }

        $history = ReadingStage::where('document_id', $id)
            ->with('transitioner:id,name,email,role')
            ->orderBy('transitioned_at', 'asc')
            ->get();

        return $this->sendResponse([
            'document' => $document,
            'timeline' => $history,
            'total_stages' => count($this->stageOrder),
            'current_step' => $this->stageOrder[$document->reading_status] ?? 1,
        ], 'Reading history timeline retrieved successfully.');
    }
}

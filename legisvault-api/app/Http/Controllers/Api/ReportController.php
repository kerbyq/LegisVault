<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Generate an executive legislative report based on dynamic filters.
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'document_type' => ['nullable', 'in:ordinance,resolution,motion,proclamation'],
            'reading_status' => [
                'nullable',
                'in:draft_received,calendared,first_reading,second_reading,third_reading_approval'
            ],
            'sponsoring_committee_id' => ['nullable', 'integer', 'exists:committees,id'],
            'year' => ['nullable', 'integer', 'min:1900'],
        ]);

        $query = Document::query()
            ->with(['committee:id,name,chairperson', 'uploader:id,name', 'approver:id,name'])
            ->filter($request->all());

        $totalCount = (clone $query)->count();

        // Status breakdown for report
        $statusBreakdown = (clone $query)
            ->select('reading_status', DB::raw('count(*) as count'))
            ->groupBy('reading_status')
            ->pluck('count', 'reading_status')
            ->toArray();

        // Type breakdown for report
        $typeBreakdown = (clone $query)
            ->select('document_type', DB::raw('count(*) as count'))
            ->groupBy('document_type')
            ->pluck('count', 'document_type')
            ->toArray();

        // Committee distribution for report
        $committeeDistribution = (clone $query)
            ->join('committees', 'documents.sponsoring_committee_id', '=', 'committees.id')
            ->select('committees.name as committee_name', DB::raw('count(documents.id) as count'))
            ->groupBy('committees.name')
            ->orderByDesc('count')
            ->get();

        // Fetch detailed document list (capped at 500 records per report)
        $limit = min((int) $request->input('limit', 200), 500);
        $documents = $query->latest('year_enacted')
            ->latest('created_at')
            ->limit($limit)
            ->get([
                'id',
                'ordinance_number',
                'title',
                'author',
                'sponsoring_committee_id',
                'year_enacted',
                'document_type',
                'reading_status',
                'file_path',
                'is_ocr_processed',
                'uploaded_by',
                'approved_by',
                'created_at',
            ]);

        // Audit this report generation event
        AuditLog::log(
            action: 'REPORT_GENERATED',
            newValues: [
                'filters' => $request->only(['date_from', 'date_to', 'document_type', 'reading_status', 'sponsoring_committee_id', 'year']),
                'total_results' => $totalCount,
            ],
            userId: $request->user()->id
        );

        return $this->sendResponse([
            'summary' => [
                'total_documents' => $totalCount,
                'status_breakdown' => $statusBreakdown,
                'type_breakdown' => $typeBreakdown,
                'committee_distribution' => $committeeDistribution,
            ],
            'filters_applied' => $request->only(['date_from', 'date_to', 'document_type', 'reading_status', 'sponsoring_committee_id', 'year']),
            'generated_at' => now()->toIso8601String(),
            'generated_by' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'role' => $request->user()->role,
            ],
            'count_in_export' => $documents->count(),
            'documents' => $documents,
        ], 'Legislative report generated successfully.');
    }
}

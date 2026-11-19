<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Perform high-performance multi-criteria search for legislative documents.
     * Uses optimized conditional query builder wheres to ensure sub-second response times.
     */
    public function search(Request $request): JsonResponse
    {
        $startTime = microtime(true);

        $keyword = trim((string) ($request->input('keyword') ?? $request->input('q') ?? ''));
        $year = $request->input('year');
        $committeeId = $request->input('committee_id');
        $type = $request->input('type');
        $status = $request->input('status');
        $hasAttachment = $request->input('has_attachment');
        $isOcrProcessed = $request->input('is_ocr_processed');
        $sortBy = $request->input('sort_by', 'relevance');
        $sortOrder = strtolower((string) $request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $perPage = min((int) $request->input('per_page', 20), 100);

        // Build base query with eager loading for minimal database queries
        $query = Document::query()
            ->with([
                'committee:id,name',
                'uploader:id,name,email',
                'approver:id,name,email',
            ]);

        // Conditional keyword search across multiple indexed fields
        $query->when($keyword !== '', function ($q) use ($keyword) {
            $q->where(function ($sub) use ($keyword) {
                // Exact or prefix match on ordinance_number (fastest index hit)
                $sub->where('ordinance_number', 'LIKE', "{$keyword}%")
                    ->orWhere('ordinance_number', 'LIKE', "%{$keyword}%")
                    ->orWhere('title', 'LIKE', "%{$keyword}%")
                    ->orWhere('author', 'LIKE', "%{$keyword}%")
                    ->orWhere('abstract', 'LIKE', "%{$keyword}%")
                    ->orWhere('ocr_text', 'LIKE', "%{$keyword}%");
            });
        });

        // Filter by Year Enacted
        $query->when(!empty($year), function ($q) use ($year) {
            $q->where('year_enacted', (int) $year);
        });

        // Filter by Sponsoring Committee
        $query->when(!empty($committeeId), function ($q) use ($committeeId) {
            $q->where('sponsoring_committee_id', (int) $committeeId);
        });

        // Filter by Document Type
        $query->when(!empty($type), function ($q) use ($type) {
            $q->where('document_type', $type);
        });

        // Filter by Reading Status
        $query->when(!empty($status), function ($q) use ($status) {
            $q->where('reading_status', $status);
        });

        // Filter by presence of attached file
        $query->when($hasAttachment !== null && $hasAttachment !== '', function ($q) use ($hasAttachment) {
            if (filter_var($hasAttachment, FILTER_VALIDATE_BOOLEAN)) {
                $q->whereNotNull('file_path');
            } else {
                $q->whereNull('file_path');
            }
        });

        // Filter by OCR processing state
        $query->when($isOcrProcessed !== null && $isOcrProcessed !== '', function ($q) use ($isOcrProcessed) {
            $q->where('is_ocr_processed', filter_var($isOcrProcessed, FILTER_VALIDATE_BOOLEAN));
        });

        // Sorting strategy
        if ($sortBy === 'relevance' && $keyword !== '') {
            // Rank exact matches in ordinance_number or title first
            $query->orderByRaw(
                "CASE 
                    WHEN ordinance_number = ? THEN 1
                    WHEN ordinance_number LIKE ? THEN 2
                    WHEN title LIKE ? THEN 3
                    ELSE 4
                END ASC",
                [$keyword, "{$keyword}%", "{$keyword}%"]
            )->orderBy('year_enacted', 'desc');
        } elseif (in_array($sortBy, ['year_enacted', 'created_at', 'title', 'ordinance_number'], true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Execute paginated search
        $results = $query->paginate($perPage);

        $executionTimeMs = round((microtime(true) - $startTime) * 1000, 2);

        return $this->sendResponse($results, 'Search completed successfully.', 200, [
            'meta' => [
                'execution_time_ms' => $executionTimeMs,
                'sub_two_minute_sla_met' => $executionTimeMs < 120000,
                'criteria' => [
                    'keyword' => $keyword,
                    'year' => $year,
                    'committee_id' => $committeeId,
                    'type' => $type,
                    'status' => $status,
                ],
            ]
        ]);
    }
}

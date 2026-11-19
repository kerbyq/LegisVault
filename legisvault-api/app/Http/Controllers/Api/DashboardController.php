<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Committee;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregate statistics and overview data for the executive dashboard.
     */
    public function stats(): JsonResponse
    {
        $currentYear = (int) date('Y');

        // Total Counts
        $totalDocuments = Document::count();
        $totalCommittees = Committee::count();
        $totalUsers = User::where('is_active', true)->count();

        // Breakdown by Reading Status
        $byStatus = Document::select('reading_status', DB::raw('count(*) as count'))
            ->groupBy('reading_status')
            ->pluck('count', 'reading_status')
            ->toArray();

        $allStatuses = [
            'draft_received' => 0,
            'calendared' => 0,
            'first_reading' => 0,
            'second_reading' => 0,
            'third_reading_approval' => 0,
        ];
        $statusDistribution = array_merge($allStatuses, $byStatus);

        // Breakdown by Document Type
        $byType = Document::select('document_type', DB::raw('count(*) as count'))
            ->groupBy('document_type')
            ->pluck('count', 'document_type')
            ->toArray();

        $allTypes = [
            'ordinance' => 0,
            'resolution' => 0,
            'motion' => 0,
            'proclamation' => 0,
        ];
        $typeDistribution = array_merge($allTypes, $byType);

        // OCR Processing Metrics
        $ocrMetrics = [
            'processed' => Document::where('is_ocr_processed', true)->count(),
            'pending' => Document::where('is_ocr_processed', false)->whereNotNull('file_path')->count(),
            'total_files' => Document::whereNotNull('file_path')->count(),
            'total_storage_bytes' => (int) Document::sum('file_size'),
        ];

        // Recent documents
        $recentDocuments = Document::with(['committee:id,name', 'uploader:id,name'])
            ->latest('created_at')
            ->limit(5)
            ->get(['id', 'ordinance_number', 'title', 'document_type', 'reading_status', 'sponsoring_committee_id', 'uploaded_by', 'created_at']);

        // Recent Audit Activity
        $recentActivity = AuditLog::with('user:id,name,role')
            ->latest('created_at')
            ->limit(10)
            ->get(['id', 'user_id', 'action', 'auditable_type', 'auditable_id', 'created_at']);

        // Monthly trends for the current year
        $monthlyTrends = Document::where('year_enacted', $currentYear)
            ->selectRaw('MONTH(created_at) as month, count(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        return $this->sendResponse([
            'overview' => [
                'total_documents' => $totalDocuments,
                'total_committees' => $totalCommittees,
                'total_active_users' => $totalUsers,
                'current_year' => $currentYear,
            ],
            'by_status' => $statusDistribution,
            'by_type' => $typeDistribution,
            'ocr_metrics' => $ocrMetrics,
            'recent_documents' => $recentDocuments,
            'recent_activity' => $recentActivity,
            'monthly_trends_current_year' => $monthlyTrends,
        ], 'Dashboard statistics retrieved successfully.');
    }
}

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\CommitteeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\HearingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkflowController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - LegisVault
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| All routes are stateless, return JSON, and are secured by Sanctum.
|
*/

// =========================================================================
// 1. Public Authentication Routes
// =========================================================================
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');

// =========================================================================
// 2. Protected Authenticated Routes (Sanctum)
// =========================================================================
Route::middleware(['auth:sanctum', 'audit'])->group(function () {

    // Current Session / Profile
    Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Dashboard Statistics (All authenticated roles: admin, uploader, viewer)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');

    // Search Engine (Sub-2-minute query builder endpoint for all roles)
    Route::get('/search', [SearchController::class, 'search'])->name('documents.search');

    // Legislative Reports (All authenticated roles)
    Route::get('/reports', [ReportController::class, 'generateReport'])->name('reports.generate');

    // =====================================================================
    // 3. Document Routes
    // =====================================================================
    // Read-only access for viewer, uploader, admin
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{id}', [DocumentController::class, 'show'])->name('documents.show');
    Route::get('/documents/{id}/download', [DocumentController::class, 'downloadFile'])->name('documents.download');
    Route::get('/documents/{id}/reading-history', [WorkflowController::class, 'getHistory'])->name('workflow.history');

    // Write operations (admin, uploader only)
    Route::middleware('role:admin,uploader')->group(function () {
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::put('/documents/{id}', [DocumentController::class, 'update'])->name('documents.update');
        Route::patch('/documents/{id}', [DocumentController::class, 'update'])->name('documents.patch');
        Route::post('/documents/{id}/upload', [DocumentController::class, 'uploadFile'])->name('documents.upload');
        Route::post('/documents/{id}/advance-stage', [WorkflowController::class, 'advanceStage'])->name('workflow.advance');
    });

    // Destructive operations (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    });

    // =====================================================================
    // 4. Committee Routes
    // =====================================================================
    // Read-only for all roles
    Route::get('/committees', [CommitteeController::class, 'index'])->name('committees.index');
    Route::get('/committees/{id}', [CommitteeController::class, 'show'])->name('committees.show');

    // CUD operations (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::post('/committees', [CommitteeController::class, 'store'])->name('committees.store');
        Route::put('/committees/{id}', [CommitteeController::class, 'update'])->name('committees.update');
        Route::patch('/committees/{id}', [CommitteeController::class, 'update'])->name('committees.patch');
        Route::delete('/committees/{id}', [CommitteeController::class, 'destroy'])->name('committees.destroy');
    });

    // =====================================================================
    // 4.5. Legislative Hearing & Session Calendar Routes
    // =====================================================================
    Route::get('/hearings', [HearingController::class, 'index'])->name('hearings.index');

    Route::middleware('role:admin,uploader')->group(function () {
        Route::post('/hearings', [HearingController::class, 'store'])->name('hearings.store');
        Route::put('/hearings/{id}', [HearingController::class, 'update'])->name('hearings.update');
        Route::patch('/hearings/{id}', [HearingController::class, 'update'])->name('hearings.patch');
    });

    Route::middleware('role:admin')->group(function () {
        Route::delete('/hearings/{id}', [HearingController::class, 'destroy'])->name('hearings.destroy');
    });

    // =====================================================================
    // 5. User Management Routes (admin only)
    // =====================================================================
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{id}', [UserController::class, 'update'])->name('users.patch');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::patch('/users/{id}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
    });

    // =====================================================================
    // 6. Audit Trail Routes (admin only)
    // =====================================================================
    Route::middleware('role:admin')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('auditLogs.index');
        Route::get('/audit-logs/{id}', [AuditLogController::class, 'show'])->name('auditLogs.show');
    });
});

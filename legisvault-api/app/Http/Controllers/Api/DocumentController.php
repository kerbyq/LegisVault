<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\ReadingStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    /**
     * Display a paginated listing of legislative documents.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 100);

        $query = Document::query()
            ->with(['committee:id,name', 'uploader:id,name,email', 'approver:id,name,email'])
            ->filter($request->all());

        // Sort ordering
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSortColumns = ['id', 'ordinance_number', 'title', 'year_enacted', 'created_at', 'reading_status'];
        if (in_array($sortBy, $allowedSortColumns, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $documents = $query->paginate($perPage);

        return $this->sendResponse($documents, 'Documents retrieved successfully.');
    }

    /**
     * Store a newly created legislative document in storage.
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $data['uploaded_by'] = $user->id;
        $data['reading_status'] = $data['reading_status'] ?? 'draft_received';

        DB::beginTransaction();
        try {
            // Handle file upload if present
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                $path = $file->storeAs('documents', $filename, 'local');

                $data['file_path'] = $path;
                $data['file_size'] = $file->getSize();
                $data['mime_type'] = $file->getClientMimeType();
            }

            $document = Document::create($data);

            // Create the initial reading stage milestone
            ReadingStage::create([
                'document_id' => $document->id,
                'stage' => $document->reading_status,
                'transitioned_by' => $user->id,
                'notes' => 'Document initially filed and registered into LegisVault.',
                'transitioned_at' => now(),
            ]);

            AuditLog::log(
                action: 'DOCUMENT_CREATED',
                model: $document,
                oldValues: null,
                newValues: [
                    'ordinance_number' => $document->ordinance_number,
                    'title' => $document->title,
                    'document_type' => $document->document_type,
                    'reading_status' => $document->reading_status,
                ],
                userId: $user->id
            );

            DB::commit();

            $document->load(['committee', 'uploader', 'readingStages.transitioner']);

            return $this->sendResponse($document, 'Document registered successfully.', Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->sendError('Failed to register document.', ['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified legislative document with relations.
     */
    public function show(int $id): JsonResponse
    {
        $document = Document::with([
            'committee',
            'uploader:id,name,email,avatar',
            'approver:id,name,email,avatar',
            'readingStages.transitioner:id,name,email',
            'amendments.amender:id,name,email',
        ])->find($id);

        if (!$document) {
            return $this->sendError('Document not found.', [], Response::HTTP_NOT_FOUND);
        }

        return $this->sendResponse($document, 'Document details retrieved successfully.');
    }

    /**
     * Update the specified legislative document.
     */
    public function update(UpdateDocumentRequest $request, int $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return $this->sendError('Document not found.', [], Response::HTTP_NOT_FOUND);
        }

        $oldValues = $document->only([
            'ordinance_number', 'title', 'author', 'sponsoring_committee_id',
            'year_enacted', 'document_type', 'reading_status', 'abstract'
        ]);

        $data = $request->validated();

        if ($request->hasFile('file')) {
            // Delete old file if present
            if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
                Storage::disk('local')->delete($document->file_path);
            }

            $file = $request->file('file');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
            $path = $file->storeAs('documents', $filename, 'local');

            $data['file_path'] = $path;
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getClientMimeType();
        }

        $document->update($data);

        AuditLog::log(
            action: 'DOCUMENT_UPDATED',
            model: $document,
            oldValues: $oldValues,
            newValues: $document->only(array_keys($oldValues)),
            userId: $request->user()->id
        );

        $document->load(['committee', 'uploader', 'approver']);

        return $this->sendResponse($document, 'Document updated successfully.');
    }

    /**
     * Remove the specified legislative document (Soft Delete).
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return $this->sendError('Document not found.', [], Response::HTTP_NOT_FOUND);
        }

        AuditLog::log(
            action: 'DOCUMENT_DELETED',
            model: $document,
            oldValues: [
                'id' => $document->id,
                'ordinance_number' => $document->ordinance_number,
                'title' => $document->title,
            ],
            userId: $request->user()->id
        );

        $document->delete();

        return $this->sendResponse(null, 'Document archived successfully.');
    }

    /**
     * Upload or replace the attached PDF/file for a document.
     */
    public function uploadFile(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:51200'],
        ]);

        $document = Document::find($id);

        if (!$document) {
            return $this->sendError('Document not found.', [], Response::HTTP_NOT_FOUND);
        }

        // Delete old file if present
        if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $file = $request->file('file');
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('documents', $filename, 'local');

        $document->update([
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
        ]);

        AuditLog::log(
            action: 'DOCUMENT_FILE_UPLOADED',
            model: $document,
            newValues: [
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType(),
            ],
            userId: $request->user()->id
        );

        return $this->sendResponse([
            'document_id' => $document->id,
            'file_path' => $document->file_path,
            'file_size' => $document->file_size,
            'mime_type' => $document->mime_type,
        ], 'File uploaded successfully.');
    }

    /**
     * Download the legislative document attachment.
     */
    public function downloadFile(int $id): StreamedResponse|JsonResponse
    {
        $document = Document::find($id);

        if (!$document || !$document->file_path) {
            return $this->sendError('Document attachment not found.', [], Response::HTTP_NOT_FOUND);
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            return $this->sendError('Attachment file missing from disk.', [], Response::HTTP_NOT_FOUND);
        }

        $extension = pathinfo($document->file_path, PATHINFO_EXTENSION);
        $downloadName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $document->ordinance_number) . '.' . $extension;

        return Storage::disk('local')->download($document->file_path, $downloadName);
    }
}

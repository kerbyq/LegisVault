<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    /**
     * Display a listing of system users with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 100);

        $query = User::query()
            ->withCount(['uploadedDocuments', 'readingStages', 'auditLogs'])
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->where('role', $request->role);
            })
            ->when($request->filled('is_active'), function ($q) use ($request) {
                $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->search;
                $q->where(function ($sub) use ($term) {
                    $sub->where('name', 'LIKE', "%{$term}%")
                        ->orWhere('email', 'LIKE', "%{$term}%");
                });
            });

        $users = $query->latest()->paginate($perPage);

        return $this->sendResponse($users, 'Users retrieved successfully.');
    }

    /**
     * Store a newly created user (Admin privilege).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:admin,uploader,viewer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        AuditLog::log(
            action: 'USER_CREATED_BY_ADMIN',
            model: $user,
            newValues: ['name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            userId: $request->user()->id
        );

        return $this->sendResponse($user, 'User account created successfully.', Response::HTTP_CREATED);
    }

    /**
     * Display the specified user profile.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::withCount(['uploadedDocuments', 'readingStages', 'auditLogs'])->find($id);

        if (!$user) {
            return $this->sendError('User not found.', [], Response::HTTP_NOT_FOUND);
        }

        return $this->sendResponse($user, 'User profile retrieved successfully.');
    }

    /**
     * Update the specified user's general information.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('User not found.', [], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'password' => ['nullable', 'string', 'min:8'],
            'is_active' => ['sometimes', 'boolean'],
            'avatar' => ['nullable', 'string', 'max:255'],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $oldValues = $user->only(['name', 'email', 'is_active', 'role']);
        $user->update($validated);

        AuditLog::log(
            action: 'USER_UPDATED',
            model: $user,
            oldValues: $oldValues,
            newValues: $user->only(['name', 'email', 'is_active', 'role']),
            userId: $request->user()->id
        );

        return $this->sendResponse($user, 'User updated successfully.');
    }

    /**
     * Update the role of a user specifically.
     */
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('User not found.', [], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'role' => ['required', 'in:admin,uploader,viewer'],
        ]);

        $oldRole = $user->role;
        $user->role = $validated['role'];
        $user->save();

        AuditLog::log(
            action: 'USER_ROLE_CHANGED',
            model: $user,
            oldValues: ['role' => $oldRole],
            newValues: ['role' => $user->role],
            userId: $request->user()->id
        );

        return $this->sendResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ], "User role changed from {$oldRole} to {$user->role}.");
    }

    /**
     * Remove the specified user account (Soft Delete).
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('User not found.', [], Response::HTTP_NOT_FOUND);
        }

        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return $this->sendError('You cannot delete your own active administrator account.', [], Response::HTTP_FORBIDDEN);
        }

        AuditLog::log(
            action: 'USER_DELETED',
            model: $user,
            oldValues: ['email' => $user->email, 'role' => $user->role],
            userId: $request->user()->id
        );

        $user->delete();

        return $this->sendResponse(null, 'User account archived successfully.');
    }
}

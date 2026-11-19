<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue an API Bearer token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->sendError('Invalid credentials.', [
                'email' => ['The provided credentials do not match our records.']
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->is_active) {
            return $this->sendError('Your account has been deactivated.', [
                'account' => ['Please contact your system administrator to re-enable access.']
            ], Response::HTTP_FORBIDDEN);
        }

        // Generate Sanctum plain text token
        $token = $user->createToken('auth-token', [$user->role])->plainTextToken;

        AuditLog::log(
            action: 'AUTH_LOGIN',
            model: $user,
            oldValues: null,
            newValues: ['email' => $user->email, 'role' => $user->role],
            userId: $user->id
        );

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful.');
    }

    /**
     * Terminate the current session and revoke the active token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            // Revoke current access token
            $user->currentAccessToken()->delete();

            AuditLog::log(
                action: 'AUTH_LOGOUT',
                model: $user,
                userId: $user->id
            );
        }

        return $this->sendResponse(null, 'Successfully logged out.');
    }

    /**
     * Get the authenticated user's profile and active permissions.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->sendResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'is_active' => $user->is_active,
            'permissions' => [
                'is_admin' => $user->isAdmin(),
                'is_uploader' => $user->isUploader(),
                'is_viewer' => $user->isViewer(),
                'can_upload_documents' => $user->isAdmin() || $user->isUploader(),
                'can_advance_stages' => $user->isAdmin() || $user->isUploader(),
                'can_manage_users' => $user->isAdmin(),
                'can_view_audit_logs' => $user->isAdmin(),
            ],
            'created_at' => $user->created_at,
        ], 'User profile retrieved successfully.');
    }

    /**
     * Register a new user account.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'viewer',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth-token', [$user->role])->plainTextToken;

        AuditLog::log(
            action: 'USER_REGISTERED',
            model: $user,
            newValues: ['name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            userId: $user->id
        );

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'is_active' => $user->is_active,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully.', Response::HTTP_CREATED);
    }
}

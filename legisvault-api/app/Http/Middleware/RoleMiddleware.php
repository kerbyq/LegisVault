<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Unauthenticated. Access token is required.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->is_active) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Account is inactive. Please contact system administrator.',
            ], Response::HTTP_FORBIDDEN);
        }

        // Expand any comma-separated roles passed in middleware parameters
        $allowedRoles = [];
        foreach ($roles as $role) {
            $allowedRoles = array_merge($allowedRoles, explode(',', $role));
        }

        if (!in_array($user->role, $allowedRoles, true)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Forbidden. Insufficient role permissions.',
                'required_roles' => $allowedRoles,
                'current_role' => $user->role,
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuditMiddleware
{
    /**
     * Sensitive fields to mask in audit logs.
     *
     * @var array<int, string>
     */
    protected array $hiddenFields = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'api_token',
        'remember_token',
        'secret',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log state-changing HTTP verbs
        $stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (in_array(strtoupper($request->method()), $stateChangingMethods, true)) {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    /**
     * Record the state-changing request to the audit_logs table.
     */
    protected function logActivity(Request $request, Response $response): void
    {
        try {
            $user = $request->user();
            $method = strtoupper($request->method());
            $path = $request->path();
            $action = "HTTP {$method} /{$path}";

            // Filter out sensitive inputs
            $payload = $request->except($this->hiddenFields);

            // Strip binary uploaded files from payload log
            foreach ($payload as $key => $value) {
                if ($request->hasFile($key)) {
                    $payload[$key] = '[UploadedFile: ' . $request->file($key)->getClientOriginalName() . ']';
                }
            }

            AuditLog::create([
                'user_id' => $user?->id,
                'action' => $action,
                'auditable_type' => null,
                'auditable_id' => null,
                'old_values' => null,
                'new_values' => [
                    'payload' => $payload,
                    'status_code' => $response->getStatusCode(),
                ],
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
            ]);
        } catch (Throwable $e) {
            // Fail silently so audit logging never blocks business transactions
            report($e);
        }
    }
}

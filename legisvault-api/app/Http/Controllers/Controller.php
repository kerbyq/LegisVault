<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

abstract class Controller
{
    /**
     * Send a standardized success JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $code
     * @param array<string, mixed> $extra
     * @return JsonResponse
     */
    protected function sendResponse(
        mixed $data,
        string $message = 'Success',
        int $code = Response::HTTP_OK,
        array $extra = []
    ): JsonResponse {
        $response = array_merge([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $extra);

        return response()->json($response, $code);
    }

    /**
     * Send a standardized error JSON response.
     *
     * @param string $error
     * @param array<string, mixed>|string $errorMessages
     * @param int $code
     * @return JsonResponse
     */
    protected function sendError(
        string $error,
        array|string $errorMessages = [],
        int $code = Response::HTTP_BAD_REQUEST
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $error,
        ];

        if (!empty($errorMessages)) {
            $response['errors'] = $errorMessages;
        }

        return response()->json($response, $code);
    }
}

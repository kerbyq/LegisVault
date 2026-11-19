<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class StoreDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return [
            'ordinance_number' => ['required', 'string', 'max:100', 'unique:documents,ordinance_number'],
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'sponsoring_committee_id' => ['required', 'integer', 'exists:committees,id'],
            'year_enacted' => ['required', 'integer', 'min:1900', "max:{$currentYear}"],
            'document_type' => ['required', 'in:ordinance,resolution,motion,proclamation'],
            'reading_status' => [
                'nullable',
                'in:draft_received,calendared,first_reading,second_reading,third_reading_approval'
            ],
            'abstract' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:51200'],
            'is_ocr_processed' => ['nullable', 'boolean'],
            'ocr_text' => ['nullable', 'string'],
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation error',
            'errors' => $validator->errors(),
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}

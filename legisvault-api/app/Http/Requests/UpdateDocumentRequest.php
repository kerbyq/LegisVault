<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class UpdateDocumentRequest extends FormRequest
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
        // Retrieve document ID from route parameter ('id' or 'document')
        $documentId = $this->route('id') ?? $this->route('document');
        if (is_object($documentId)) {
            $documentId = $documentId->id;
        }

        return [
            'ordinance_number' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('documents', 'ordinance_number')->ignore($documentId),
            ],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'author' => ['sometimes', 'required', 'string', 'max:255'],
            'sponsoring_committee_id' => ['sometimes', 'required', 'integer', 'exists:committees,id'],
            'year_enacted' => ['sometimes', 'required', 'integer', 'min:1900', "max:{$currentYear}"],
            'document_type' => ['sometimes', 'required', 'in:ordinance,resolution,motion,proclamation'],
            'reading_status' => [
                'sometimes',
                'required',
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

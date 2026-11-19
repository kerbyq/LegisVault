<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Committee;
use App\Models\Document;
use App\Models\ReadingStage;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed sample legislative documents for Naga City Sangguniang Panlungsod.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $uploader = User::where('role', 'uploader')->first() ?? $admin;

        $commLaws = Committee::where('name', 'LIKE', '%Laws%')->first();
        $commFinance = Committee::where('name', 'LIKE', '%Appropriations%')->first();
        $commHealth = Committee::where('name', 'LIKE', '%Health%')->first();

        $samples = [
            [
                'ordinance_number' => 'ORD-2024-001',
                'title' => 'An Ordinance Establishing the Naga City Digital Governance and Legislative Information Archival Code',
                'author' => 'Hon. Councilor Jiel R. Gomez',
                'sponsoring_committee_id' => $commLaws?->id ?? 1,
                'year_enacted' => 2024,
                'document_type' => 'ordinance',
                'reading_status' => 'third_reading_approval',
                'abstract' => 'Mandates the complete digitization of all historical and current city ordinances and resolutions through an open digital repository.',
                'file_path' => null,
                'file_size' => null,
                'mime_type' => 'application/pdf',
                'is_ocr_processed' => true,
                'ocr_text' => 'REPUBLIC OF THE PHILIPPINES CITY OF NAGA SANGGUNIANG PANLUNGSOD ORDINANCE NO. 2024-001. DIGITAL GOVERNANCE CODE. BE IT ORDAINED by the Sangguniang Panlungsod of the City of Naga in session assembled, that all city legislation shall be digitally archived with OCR search capabilities.',
                'uploaded_by' => $uploader->id,
                'approved_by' => $admin->id,
            ],
            [
                'ordinance_number' => 'ORD-2024-012',
                'title' => 'An Ordinance Approving the Supplemental Annual Investment Plan and Executive Budget of Naga City for FY 2024',
                'author' => 'Hon. Councilor Melvin Ramon G. Buenafe',
                'sponsoring_committee_id' => $commFinance?->id ?? 2,
                'year_enacted' => 2024,
                'document_type' => 'ordinance',
                'reading_status' => 'third_reading_approval',
                'abstract' => 'Appropriates supplemental funding from unappropriated surplus for urban drainage improvements and civic digital infrastructure.',
                'file_path' => null,
                'file_size' => null,
                'mime_type' => 'application/pdf',
                'is_ocr_processed' => false,
                'ocr_text' => 'SUPPLEMENTAL APPROPRIATION ORDINANCE 2024-012. Providing budget authorization for community health centers and drainage dredging.',
                'uploaded_by' => $uploader->id,
                'approved_by' => $admin->id,
            ],
            [
                'ordinance_number' => 'RES-2024-045',
                'title' => 'Resolution Commending the Naga City Youth Robotics Team for Garnering International Honors in the 2024 World Robot Olympiad',
                'author' => 'Hon. Councilor Ghiel G. Rosales',
                'sponsoring_committee_id' => $commHealth?->id ?? 1,
                'year_enacted' => 2024,
                'document_type' => 'resolution',
                'reading_status' => 'second_reading',
                'abstract' => 'Extends profound commendation and monetary incentive to the high school robotic delegation from Naga City Science High School.',
                'file_path' => null,
                'file_size' => null,
                'mime_type' => null,
                'is_ocr_processed' => false,
                'ocr_text' => null,
                'uploaded_by' => $uploader->id,
                'approved_by' => null,
            ],
            [
                'ordinance_number' => 'ORD-2025-003',
                'title' => 'An Ordinance Regulating the Operation of E-Trikes and Micromobility Conveyances Along National Highways and City Arterials in Naga City',
                'author' => 'Hon. Councilor Vidal P. Castillo',
                'sponsoring_committee_id' => $commLaws?->id ?? 1,
                'year_enacted' => 2025,
                'document_type' => 'ordinance',
                'reading_status' => 'first_reading',
                'abstract' => 'Institutionalizes designated safety lanes, helmet mandates, and speed restrictions for light electric vehicles across the central business district.',
                'file_path' => null,
                'file_size' => null,
                'mime_type' => null,
                'is_ocr_processed' => false,
                'ocr_text' => null,
                'uploaded_by' => $uploader->id,
                'approved_by' => null,
            ],
        ];

        foreach ($samples as $item) {
            $doc = Document::updateOrCreate(
                ['ordinance_number' => $item['ordinance_number']],
                $item
            );

            // Populate reading stages for the document
            ReadingStage::updateOrCreate(
                ['document_id' => $doc->id, 'stage' => 'draft_received'],
                [
                    'transitioned_by' => $uploader->id,
                    'notes' => 'Draft formally filed with the Secretariat.',
                    'transitioned_at' => now()->subDays(30),
                ]
            );

            if (in_array($doc->reading_status, ['calendared', 'first_reading', 'second_reading', 'third_reading_approval'])) {
                ReadingStage::updateOrCreate(
                    ['document_id' => $doc->id, 'stage' => 'calendared'],
                    [
                        'transitioned_by' => $uploader->id,
                        'notes' => 'Calendared for plenary session.',
                        'transitioned_at' => now()->subDays(20),
                    ]
                );
            }

            if (in_array($doc->reading_status, ['first_reading', 'second_reading', 'third_reading_approval'])) {
                ReadingStage::updateOrCreate(
                    ['document_id' => $doc->id, 'stage' => 'first_reading'],
                    [
                        'transitioned_by' => $uploader->id,
                        'notes' => 'Referred to sponsoring committee upon first reading.',
                        'transitioned_at' => now()->subDays(15),
                    ]
                );
            }

            if (in_array($doc->reading_status, ['second_reading', 'third_reading_approval'])) {
                ReadingStage::updateOrCreate(
                    ['document_id' => $doc->id, 'stage' => 'second_reading'],
                    [
                        'transitioned_by' => $uploader->id,
                        'notes' => 'Floor debates concluded; committee report approved.',
                        'transitioned_at' => now()->subDays(7),
                    ]
                );
            }

            if ($doc->reading_status === 'third_reading_approval') {
                ReadingStage::updateOrCreate(
                    ['document_id' => $doc->id, 'stage' => 'third_reading_approval'],
                    [
                        'transitioned_by' => $admin->id,
                        'notes' => 'Nominal voting conducted; enacted by affirmative majority.',
                        'transitioned_at' => now()->subDays(2),
                    ]
                );
            }

            AuditLog::updateOrCreate(
                ['action' => "SEEDED_{$doc->ordinance_number}"],
                [
                    'user_id' => $admin->id,
                    'auditable_type' => Document::class,
                    'auditable_id' => $doc->id,
                    'old_values' => null,
                    'new_values' => ['title' => $doc->title, 'ordinance_number' => $doc->ordinance_number],
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'LegisVault Seeder',
                ]
            );
        }
    }
}

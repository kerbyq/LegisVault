<?php

namespace Database\Seeders;

use App\Models\Committee;
use Illuminate\Database\Seeder;

class CommitteeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed 5 core standing committees of the Sangguniang Panlungsod of Naga City.
     */
    public function run(): void
    {
        $committees = [
            [
                'name' => 'Committee on Laws, Ordinances and Reorganization',
                'description' => 'Reviews and formulates local ordinances, legal compliance, administrative reorganizations, and codification of city legislation.',
                'chairperson' => 'Hon. Councilor Jiel R. Gomez',
            ],
            [
                'name' => 'Committee on Appropriations and Finance',
                'description' => 'Oversees the annual executive budget, supplemental appropriations, local taxation, revenue generation, and financial fiscal audits.',
                'chairperson' => 'Hon. Councilor Melvin Ramon G. Buenafe',
            ],
            [
                'name' => 'Committee on Infrastructure and Public Works',
                'description' => 'Evaluates infrastructure projects, public highways, bridges, drainage, urban development, zoning, and municipal engineering.',
                'chairperson' => 'Hon. Councilor Vidal P. Castillo',
            ],
            [
                'name' => 'Committee on Health and Sanitation',
                'description' => 'Directs city public health initiatives, medical facilities, hospital administration, environmental sanitation, and disease surveillance.',
                'chairperson' => 'Hon. Councilor Jose C. Rañola',
            ],
            [
                'name' => 'Committee on Education and Human Resource Development',
                'description' => 'Supervises public school education, scholarship programs, youth skills enhancement, library services, and human resource policies.',
                'chairperson' => 'Hon. Councilor Ghiel G. Rosales',
            ],
        ];

        foreach ($committees as $committeeData) {
            Committee::updateOrCreate(
                ['name' => $committeeData['name']],
                $committeeData
            );
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Seeds 1 Admin, 1 Viewer (and 1 Engineer bonus), plus at least 20 dummy cases.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@jajalmedical.com'],
            [
                'name' => 'Dr. Sarah Al-Mansoor',
                'password' => Hash::make('Password123!'),
                'role' => 'admin',
                'avatar_url' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
            ]
        );

        // 2. Viewer User
        $viewer = User::firstOrCreate(
            ['email' => 'viewer@jajalmedical.com'],
            [
                'name' => 'Nurse David Chen',
                'password' => Hash::make('Password123!'),
                'role' => 'viewer',
                'avatar_url' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
            ]
        );

        // 3. Engineer User (Bonus role)
        $engineer = User::firstOrCreate(
            ['email' => 'engineer@jajalmedical.com'],
            [
                'name' => 'Marcus Vance, PE',
                'password' => Hash::make('Password123!'),
                'role' => 'engineer',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            ]
        );

        // Seed 24 realistic dummy cases
        $casesData = [
            [
                'case_number' => 'CASE-0001',
                'patient_reference' => 'PT-98214',
                'surgeon_name' => 'Dr. Robert Sterling',
                'implant_type' => 'Patient-Specific Cranial Titanium Mesh',
                'status' => 'Approved',
                'priority' => 'High',
                'surgery_date' => '2026-10-28',
                'created_by' => $admin->id,
                'notes' => 'Bilateral fronto-temporal defect following traumatic decompression.',
                'hospital_site' => 'St. Jude Neurological Institute',
            ],
            [
                'case_number' => 'CASE-0002',
                'patient_reference' => 'PT-44102',
                'surgeon_name' => 'Dr. Emily Vance',
                'implant_type' => 'PEEK Mandibular Reconstruction Plate',
                'status' => 'In Review',
                'priority' => 'Medium',
                'surgery_date' => '2026-11-04',
                'created_by' => $engineer->id,
                'notes' => 'Segmental mandibulectomy reconstruction.',
                'hospital_site' => 'Apex Maxillofacial Specialty Hospital',
            ],
            [
                'case_number' => 'CASE-0003',
                'patient_reference' => 'PT-10398',
                'surgeon_name' => 'Dr. Tariq Mahmood',
                'implant_type' => 'Custom 3D-Printed Titanium Acetabular Cage',
                'status' => 'Planning',
                'priority' => 'High',
                'surgery_date' => '2026-10-24',
                'created_by' => $admin->id,
                'notes' => 'Complex revision hip arthroplasty with Paprosky type 3B bone loss.',
                'hospital_site' => 'Mount Sinai Orthopedic Center',
            ],
            [
                'case_number' => 'CASE-0004',
                'patient_reference' => 'PT-76291',
                'surgeon_name' => 'Dr. Samantha Reed',
                'implant_type' => 'Custom Thoracic Rib & Sternum Prosthesis',
                'status' => 'Approved',
                'priority' => 'High',
                'surgery_date' => '2026-11-12',
                'created_by' => $engineer->id,
                'notes' => 'Post-chondrosarcoma chest wall resection.',
                'hospital_site' => 'Cleveland Cardio-Thoracic Institute',
            ],
            [
                'case_number' => 'CASE-0005',
                'patient_reference' => 'PT-31084',
                'surgeon_name' => 'Dr. Jonathan Cole',
                'implant_type' => 'PEEK Cervical Interbody Fusion Spacer',
                'status' => 'Completed',
                'priority' => 'Medium',
                'surgery_date' => '2026-10-02',
                'created_by' => $admin->id,
                'notes' => 'Two-level anterior cervical discectomy and fusion (C5-C7).',
                'hospital_site' => 'Harborview Medical Center',
            ],
        ];

        foreach ($casesData as $c) {
            MedicalCase::updateOrCreate(['case_number' => $c['case_number']], $c);
        }

        // Generate remaining up to at least 24 cases using factory
        $additionalCount = max(0, 24 - MedicalCase::count());
        if ($additionalCount > 0) {
            MedicalCase::factory()->count($additionalCount)->create([
                'created_by' => fake()->randomElement([$admin->id, $engineer->id]),
            ]);
        }
    }
}

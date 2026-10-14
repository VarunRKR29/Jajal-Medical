<?php

namespace Database\Factories;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicalCaseFactory extends Factory
{
    protected $model = MedicalCase::class;

    public function definition(): array
    {
        $implantTypes = [
            'Patient-Specific Cranial Titanium Mesh',
            'PEEK Mandibular Reconstruction Plate',
            'Custom 3D-Printed Titanium Acetabular Cage',
            'Custom Thoracic Rib & Sternum Prosthesis',
            'PEEK Cervical Interbody Fusion Spacer',
            'Orbital Floor Titanium Reconstruction Mesh',
            'Custom Temporomandibular Joint (TMJ) Prosthesis',
            'Porous Titanium Tibial Cone Spacer',
            'Custom Calvarial Resorbable Scaffold',
            'Maxillary Le Fort I Distraction Osteogenesis System',
        ];

        $surgeons = [
            'Dr. Robert Sterling',
            'Dr. Emily Vance',
            'Dr. Tariq Mahmood',
            'Dr. Samantha Reed',
            'Dr. Jonathan Cole',
            'Dr. Karen White',
            'Dr. Michael Chang',
        ];

        $statuses = ['Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled'];
        $priorities = ['Low', 'Medium', 'High'];

        return [
            'case_number' => 'CASE-' . fake()->unique()->numberBetween(1000, 9999),
            'patient_reference' => 'PT-' . fake()->numberBetween(10000, 99999), // Dummy code, not real name
            'surgeon_name' => fake()->randomElement($surgeons),
            'implant_type' => fake()->randomElement($implantTypes),
            'status' => fake()->randomElement($statuses),
            'priority' => fake()->randomElement($priorities),
            'surgery_date' => fake()->optional(0.8)->dateTimeBetween('now', '+3 months')?->format('Y-m-d'),
            'created_by' => User::factory(),
            'notes' => fake()->paragraph(),
            'hospital_site' => fake()->company() . ' Surgical Pavilion',
        ];
    }
}

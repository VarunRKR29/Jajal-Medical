<?php

namespace Tests\Feature;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MedicalCaseApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $viewer;
    protected User $engineer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@jajalmedical.com',
            'role' => 'admin',
            'password' => bcrypt('Password123!'),
        ]);

        $this->viewer = User::factory()->create([
            'email' => 'viewer@jajalmedical.com',
            'role' => 'viewer',
            'password' => bcrypt('Password123!'),
        ]);

        $this->engineer = User::factory()->create([
            'email' => 'engineer@jajalmedical.com',
            'role' => 'engineer',
            'password' => bcrypt('Password123!'),
        ]);
    }

    /**
     * Test 1: Valid login succeeds.
     */
    public function test_valid_login_succeeds(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@jajalmedical.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email', 'role'],
                ],
                'message',
            ]);
    }

    /**
     * Test 2: Invalid login is rejected.
     */
    public function test_invalid_login_is_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@jajalmedical.com',
            'password' => 'WrongPassword999!',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password.',
            ])
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 3: A guest cannot open case pages or APIs (401 / redirect).
     */
    public function test_guest_cannot_open_case_pages_or_apis(): void
    {
        // Unauthenticated request to cases endpoint
        $response = $this->getJson('/api/cases');

        $response->assertStatus(401);
    }

    /**
     * Test 4: Admin can create a case.
     */
    public function test_admin_can_create_a_case(): void
    {
        $payload = [
            'case_number' => 'CASE-TEST-001',
            'patient_reference' => 'PT-50119',
            'surgeon_name' => 'Dr. Elizabeth Blackwell',
            'implant_type' => 'Custom PEEK Cranial Plate',
            'status' => 'Planning',
            'priority' => 'High',
            'surgery_date' => '2026-11-20',
            'notes' => 'Patient-specific 3D contour matched.',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/cases', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Case created successfully',
                'data' => [
                    'case_number' => 'CASE-TEST-001',
                    'patient_reference' => 'PT-50119',
                    'surgeon_name' => 'Dr. Elizabeth Blackwell',
                    'created_by' => $this->admin->id,
                ],
            ]);

        $this->assertDatabaseHas('cases', [
            'case_number' => 'CASE-TEST-001',
            'created_by' => $this->admin->id,
        ]);
    }

    /**
     * Test 5: Creating a case with a duplicate Case Number fails (422).
     */
    public function test_creating_a_case_with_duplicate_case_number_fails(): void
    {
        // Pre-create existing case
        MedicalCase::factory()->create([
            'case_number' => 'CASE-DUPLICATE-999',
            'created_by' => $this->admin->id,
        ]);

        $duplicatePayload = [
            'case_number' => 'CASE-DUPLICATE-999',
            'patient_reference' => 'PT-12345',
            'surgeon_name' => 'Dr. Gregory House',
            'implant_type' => 'Titanium Plate',
            'status' => 'Draft',
            'priority' => 'Medium',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/cases', $duplicatePayload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'The given data was invalid.',
            ])
            ->assertJsonValidationErrors(['case_number']);
    }

    /**
     * Test 6: Viewer cannot delete a case (403).
     */
    public function test_viewer_cannot_delete_a_case(): void
    {
        $case = MedicalCase::factory()->create([
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->viewer, 'sanctum')
            ->deleteJson("/api/cases/{$case->id}");

        $response->assertStatus(403);

        // Verify case is still in database
        $this->assertDatabaseHas('cases', [
            'id' => $case->id,
        ]);
    }

    /**
     * Bonus Test 7: Viewer cannot create a case (403).
     */
    public function test_viewer_cannot_create_a_case(): void
    {
        $payload = [
            'case_number' => 'CASE-VIEWER-BLOCKED',
            'patient_reference' => 'PT-99999',
            'surgeon_name' => 'Dr. Strange',
            'implant_type' => 'Cranial Mesh',
            'status' => 'Draft',
            'priority' => 'Low',
        ];

        $response = $this->actingAs($this->viewer, 'sanctum')
            ->postJson('/api/cases', $payload);

        $response->assertStatus(403);
    }

    /**
     * Bonus Test 8: Engineer can create but cannot delete (403).
     */
    public function test_engineer_can_create_but_cannot_delete(): void
    {
        $payload = [
            'case_number' => 'CASE-ENG-001',
            'patient_reference' => 'PT-88112',
            'surgeon_name' => 'Dr. Emily Vance',
            'implant_type' => 'PEEK Spacer',
            'status' => 'Planning',
            'priority' => 'Medium',
        ];

        // Engineer creates -> 201
        $createRes = $this->actingAs($this->engineer, 'sanctum')
            ->postJson('/api/cases', $payload);
        $createRes->assertStatus(201);

        $createdId = $createRes->json('data.id');

        // Engineer deletes -> 403 Forbidden
        $deleteRes = $this->actingAs($this->engineer, 'sanctum')
            ->deleteJson("/api/cases/{$createdId}");
        $deleteRes->assertStatus(403);
    }
}

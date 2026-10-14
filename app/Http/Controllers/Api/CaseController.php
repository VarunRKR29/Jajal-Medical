<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCaseRequest;
use App\Http\Requests\UpdateCaseRequest;
use App\Models\MedicalCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    /**
     * Display a listing of the resource (paginated, searched, filtered).
     * Endpoint: GET /api/cases
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MedicalCase::class);

        $perPage = (int) $request->input('per_page', 10);
        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Allowed sort columns
        $allowedSorts = ['id', 'case_number', 'surgeon_name', 'status', 'priority', 'surgery_date', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'id';
        }

        $query = MedicalCase::with('creator:id,name,email,role')
            ->search($search)
            ->filterStatus($status)
            ->filterPriority($priority)
            ->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        $paginated = $query->paginate($perPage);

        // Aggregate statistics for dashboard & metrics
        $stats = [
            'total' => MedicalCase::count(),
            'draft' => MedicalCase::where('status', 'Draft')->count(),
            'planning' => MedicalCase::where('status', 'Planning')->count(),
            'in_review' => MedicalCase::where('status', 'In Review')->count(),
            'approved' => MedicalCase::where('status', 'Approved')->count(),
            'completed' => MedicalCase::where('status', 'Completed')->count(),
            'cancelled' => MedicalCase::where('status', 'Cancelled')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'cases' => $paginated->items(),
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                    'from' => $paginated->firstItem() ?? 0,
                    'to' => $paginated->lastItem() ?? 0,
                ],
                'stats' => $stats,
            ],
            'message' => 'Cases retrieved successfully',
        ], 200);
    }

    /**
     * Store a newly created case in storage.
     * Endpoint: POST /api/cases
     */
    public function store(StoreCaseRequest $request): JsonResponse
    {
        $this->authorize('create', MedicalCase::class);

        $validated = $request->validated();
        
        // created_by is set automatically to the logged-in user
        $validated['created_by'] = $request->user()->id;

        $case = MedicalCase::create($validated);
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Case created successfully',
        ], 201);
    }

    /**
     * Display the specified case.
     * Endpoint: GET /api/cases/{id}
     */
    public function show(int $id): JsonResponse
    {
        $case = MedicalCase::with('creator:id,name,email,role')->find($id);

        if (!$case) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Case not found.',
            ], 404);
        }

        $this->authorize('view', $case);

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Case retrieved successfully',
        ], 200);
    }

    /**
     * Update the specified case in storage.
     * Endpoint: PUT /api/cases/{id}
     */
    public function update(UpdateCaseRequest $request, int $id): JsonResponse
    {
        $case = MedicalCase::find($id);

        if (!$case) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Case not found.',
            ], 404);
        }

        $this->authorize('update', $case);

        $case->update($request->validated());
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Case updated successfully',
        ], 200);
    }

    /**
     * Remove the specified case from storage (Admin only).
     * Endpoint: DELETE /api/cases/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $case = MedicalCase::find($id);

        if (!$case) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Case not found.',
            ], 404);
        }

        // Server-side authorization check (CasePolicy@delete)
        $this->authorize('delete', $case);

        $case->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Case deleted successfully',
        ], 200);
    }
}

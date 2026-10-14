import fs from 'fs';
import path from 'path';
import { User, MedicalCase, CaseStatus, CasePriority } from './types.js';

interface DatabaseSchema {
  users: User[];
  cases: MedicalCase[];
  tokens: { token: string; user_id: number; created_at: string }[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'database.json');

// Initial seed users
const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Dr. Sarah Al-Mansoor',
    email: 'admin@jajalmedical.com',
    password_hash: 'Password123!', // Plain comparison for dummy demo ease
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 2,
    name: 'Nurse David Chen',
    email: 'viewer@jajalmedical.com',
    password_hash: 'Password123!',
    role: 'viewer',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 3,
    name: 'Marcus Vance, PE',
    email: 'engineer@jajalmedical.com',
    password_hash: 'Password123!',
    role: 'engineer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
];

const INITIAL_CASES_SEED: Omit<MedicalCase, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    case_number: 'CASE-0001',
    patient_reference: 'PT-98214',
    surgeon_name: 'Dr. Robert Sterling',
    implant_type: 'Patient-Specific Cranial Titanium Mesh',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-28',
    created_by: 1,
    notes: 'Bilateral fronto-temporal defect following traumatic decompression. Rapid 3D prototyping approved.',
    hospital_site: 'St. Jude Neurological Institute',
  },
  {
    case_number: 'CASE-0002',
    patient_reference: 'PT-44102',
    surgeon_name: 'Dr. Emily Vance',
    implant_type: 'PEEK Mandibular Reconstruction Plate',
    status: 'In Review',
    priority: 'Medium',
    surgery_date: '2026-11-04',
    created_by: 3,
    notes: 'Segmental mandibulectomy reconstruction. Virtual surgical planning session completed.',
    hospital_site: 'Apex Maxillofacial Specialty Hospital',
  },
  {
    case_number: 'CASE-0003',
    patient_reference: 'PT-10398',
    surgeon_name: 'Dr. Tariq Mahmood',
    implant_type: 'Custom 3D-Printed Titanium Acetabular Cage',
    status: 'Planning',
    priority: 'High',
    surgery_date: '2026-10-24',
    created_by: 1,
    notes: 'Complex revision hip arthroplasty with Paprosky type 3B bone loss.',
    hospital_site: 'Mount Sinai Orthopedic Center',
  },
  {
    case_number: 'CASE-0004',
    patient_reference: 'PT-76291',
    surgeon_name: 'Dr. Samantha Reed',
    implant_type: 'Custom Thoracic Rib & Sternum Prosthesis',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-11-12',
    created_by: 3,
    notes: 'Post-chondrosarcoma chest wall resection. Finite element analysis verified stress tolerances.',
    hospital_site: 'Cleveland Cardio-Thoracic Institute',
  },
  {
    case_number: 'CASE-0005',
    patient_reference: 'PT-31084',
    surgeon_name: 'Dr. Jonathan Cole',
    implant_type: 'PEEK Cervical Interbody Fusion Spacer',
    status: 'Completed',
    priority: 'Medium',
    surgery_date: '2026-10-02',
    created_by: 1,
    notes: 'Two-level anterior cervical discectomy and fusion (C5-C7). Successful osseointegration observed.',
    hospital_site: 'Harborview Medical Center',
  },
  {
    case_number: 'CASE-0006',
    patient_reference: 'PT-88401',
    surgeon_name: 'Dr. Karen White',
    implant_type: 'Orbital Floor Titanium Reconstruction Mesh',
    status: 'In Review',
    priority: 'Low',
    surgery_date: '2026-11-18',
    created_by: 3,
    notes: 'Traumatic blowout orbital fracture. Awaiting radiologist review of coronal CT slices.',
    hospital_site: 'Boston Eye and Ear Specialty Pavilion',
  },
  {
    case_number: 'CASE-0007',
    patient_reference: 'PT-55293',
    surgeon_name: 'Dr. Robert Sterling',
    implant_type: 'Custom Temporomandibular Joint (TMJ) Prosthesis',
    status: 'Draft',
    priority: 'Medium',
    surgery_date: '2026-12-05',
    created_by: 1,
    notes: 'End-stage TMJ degenerative joint disease. Initial DICOM files received for segmentation.',
    hospital_site: 'St. Jude Neurological Institute',
  },
  {
    case_number: 'CASE-0008',
    patient_reference: 'PT-66712',
    surgeon_name: 'Dr. Michael Chang',
    implant_type: 'Porous Titanium Tibial Cone Spacer',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-10-30',
    created_by: 1,
    notes: 'Revision total knee arthroplasty with severe metaphyseal bone loss.',
    hospital_site: 'Stanford Health Care Center',
  },
  {
    case_number: 'CASE-0009',
    patient_reference: 'PT-22904',
    surgeon_name: 'Dr. Emily Vance',
    implant_type: 'Custom Calvarial Resorbable Scaffold',
    status: 'Planning',
    priority: 'Low',
    surgery_date: '2026-12-15',
    created_by: 3,
    notes: 'Pediatric cranial remodeling. Bio-resorbable polymer structure under review.',
    hospital_site: 'Apex Maxillofacial Specialty Hospital',
  },
  {
    case_number: 'CASE-0010',
    patient_reference: 'PT-99411',
    surgeon_name: 'Dr. Jonathan Cole',
    implant_type: 'Custom Lumbar Sacral Fixation Plate',
    status: 'Completed',
    priority: 'High',
    surgery_date: '2026-09-28',
    created_by: 1,
    notes: 'L5-S1 spondylolisthesis grade IV revision fixation. Complete post-op stabilization confirmed.',
    hospital_site: 'Harborview Medical Center',
  },
  {
    case_number: 'CASE-0011',
    patient_reference: 'PT-12480',
    surgeon_name: 'Dr. Samantha Reed',
    implant_type: 'Pectus Excavatum Customized Titanium Bar',
    status: 'Approved',
    priority: 'Low',
    surgery_date: '2026-11-20',
    created_by: 3,
    notes: 'Severe Haller index 4.2 pectus deformity. Bar pre-bent to patient anatomy model.',
    hospital_site: 'Cleveland Cardio-Thoracic Institute',
  },
  {
    case_number: 'CASE-0012',
    patient_reference: 'PT-77123',
    surgeon_name: 'Dr. Robert Sterling',
    implant_type: 'Titanium Cranioplasty Flap with Sensor Bracket',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-08',
    created_by: 1,
    notes: 'Right pterional defect with integrated intracranial pressure sensor cradle.',
    hospital_site: 'St. Jude Neurological Institute',
  },
  {
    case_number: 'CASE-0013',
    patient_reference: 'PT-33091',
    surgeon_name: 'Dr. Tariq Mahmood',
    implant_type: 'Proximal Femoral Replacement Mega-Prosthesis',
    status: 'Planning',
    priority: 'High',
    surgery_date: '2026-11-02',
    created_by: 1,
    notes: 'Oncologic resection of proximal femur osteosarcoma. Modular stem engineering in progress.',
    hospital_site: 'Mount Sinai Orthopedic Center',
  },
  {
    case_number: 'CASE-0014',
    patient_reference: 'PT-88022',
    surgeon_name: 'Dr. Karen White',
    implant_type: 'Custom Zygomatic Arch Reconstruction Plate',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 3,
    notes: 'Secondary correction of complex zygomaticomaxillary complex fracture.',
    hospital_site: 'Boston Eye and Ear Specialty Pavilion',
  },
  {
    case_number: 'CASE-0015',
    patient_reference: 'PT-50914',
    surgeon_name: 'Dr. Michael Chang',
    implant_type: 'Custom Distal Femur Resection Guide & Plate',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-11-25',
    created_by: 1,
    notes: 'Patient-specific surgical cutting guides sterilized and shipped to facility.',
    hospital_site: 'Stanford Health Care Center',
  },
  {
    case_number: 'CASE-0016',
    patient_reference: 'PT-41009',
    surgeon_name: 'Dr. Emily Vance',
    implant_type: 'Maxillary Le Fort I Distraction Osteogenesis System',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-12-01',
    created_by: 3,
    notes: 'Craniofacial hypoplasia. Distractor vector orientation simulated in CAD.',
    hospital_site: 'Apex Maxillofacial Specialty Hospital',
  },
  {
    case_number: 'CASE-0017',
    patient_reference: 'PT-63910',
    surgeon_name: 'Dr. Jonathan Cole',
    implant_type: '3D Porous Titanium Cervical Corpectomy Cage',
    status: 'Completed',
    priority: 'High',
    surgery_date: '2026-09-15',
    created_by: 1,
    notes: 'C6 traumatic burst fracture. Anterior corpectomy and instrumented stabilization completed.',
    hospital_site: 'Harborview Medical Center',
  },
  {
    case_number: 'CASE-0018',
    patient_reference: 'PT-19402',
    surgeon_name: 'Dr. Samantha Reed',
    implant_type: 'Custom Clavicle Reconstruction Plate',
    status: 'In Review',
    priority: 'Low',
    surgery_date: '2026-11-15',
    created_by: 3,
    notes: 'Non-union of midshaft clavicle fracture with severe shortening.',
    hospital_site: 'Cleveland Cardio-Thoracic Institute',
  },
  {
    case_number: 'CASE-0019',
    patient_reference: 'PT-72819',
    surgeon_name: 'Dr. Robert Sterling',
    implant_type: 'Custom Suboccipital Craniectomy Mesh',
    status: 'Cancelled',
    priority: 'Medium',
    surgery_date: null,
    created_by: 1,
    notes: 'Case cancelled by surgical team due to medical contraindications.',
    hospital_site: 'St. Jude Neurological Institute',
  },
  {
    case_number: 'CASE-0020',
    patient_reference: 'PT-39182',
    surgeon_name: 'Dr. Tariq Mahmood',
    implant_type: '3D-Printed Trabecular Metal Acetabular Augment',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-29',
    created_by: 1,
    notes: 'Superior dome pelvic defect reconstructive augment matching native modulus of elasticity.',
    hospital_site: 'Mount Sinai Orthopedic Center',
  },
  {
    case_number: 'CASE-0021',
    patient_reference: 'PT-84721',
    surgeon_name: 'Dr. Michael Chang',
    implant_type: 'Patient-Specific Distal Tibia Osteotomy Wedge',
    status: 'Planning',
    priority: 'Low',
    surgery_date: '2026-12-10',
    created_by: 3,
    notes: 'Supramalleolar osteotomy for asymmetric ankle arthrosis. Correction angle verified at 8.5 degrees.',
    hospital_site: 'Stanford Health Care Center',
  },
  {
    case_number: 'CASE-0022',
    patient_reference: 'PT-52901',
    surgeon_name: 'Dr. Karen White',
    implant_type: 'Custom Orbital Rim and Floor Combo Scaffold',
    status: 'Draft',
    priority: 'Medium',
    surgery_date: null,
    created_by: 1,
    notes: 'Awaiting high-resolution 0.5mm thin slice facial bones protocol CT.',
    hospital_site: 'Boston Eye and Ear Specialty Pavilion',
  },
  {
    case_number: 'CASE-0023',
    patient_reference: 'PT-60294',
    surgeon_name: 'Dr. Jonathan Cole',
    implant_type: 'Custom Patient-Matched Occipitocervical Fusion Rods',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-22',
    created_by: 1,
    notes: 'Basilar invagination and craniocervical instability. Custom sagittal curvature designed.',
    hospital_site: 'Harborview Medical Center',
  },
  {
    case_number: 'CASE-0024',
    patient_reference: 'PT-91823',
    surgeon_name: 'Dr. Samantha Reed',
    implant_type: 'Custom Sternal Body Replacement Plate',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-11-05',
    created_by: 3,
    notes: 'Sternal dehiscence following cardiac bypass. Rigid fixation plate with locking screws.',
    hospital_site: 'Cleveland Cardio-Thoracic Institute',
  },
];

class DatabaseService {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.cases && parsed.tokens) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database. Initializing fresh seed.', e);
    }

    return this.createFreshDatabase();
  }

  private createFreshDatabase(): DatabaseSchema {
    const freshUsers = [...INITIAL_USERS];
    const freshCases: MedicalCase[] = INITIAL_CASES_SEED.map((seed, index) => {
      const id = index + 1;
      const createdDate = new Date(Date.now() - (30 - index) * 24 * 3600 * 1000).toISOString();
      return {
        ...seed,
        id,
        created_at: createdDate,
        updated_at: createdDate,
      };
    });

    const schema: DatabaseSchema = {
      users: freshUsers,
      cases: freshCases,
      tokens: [
        {
          token: 'sanctum_admin_token_001_seed',
          user_id: 1,
          created_at: new Date().toISOString(),
        },
        {
          token: 'sanctum_viewer_token_002_seed',
          user_id: 2,
          created_at: new Date().toISOString(),
        },
        {
          token: 'sanctum_engineer_token_003_seed',
          user_id: 3,
          created_at: new Date().toISOString(),
        },
      ],
    };

    this.persist(schema);
    return schema;
  }

  private persist(data?: DatabaseSchema) {
    try {
      const dataToSave = data || this.schema;
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetDatabase(): void {
    this.schema = this.createFreshDatabase();
  }

  // User & Auth Operations
  public findUserByEmail(email: string): User | undefined {
    return this.schema.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public findUserById(id: number): User | undefined {
    return this.schema.users.find((u) => u.id === id);
  }

  public createToken(userId: number): string {
    const token = `sanctum_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    this.schema.tokens.push({
      token,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    this.persist();
    return token;
  }

  public findUserByToken(token: string): User | undefined {
    const tokenRecord = this.schema.tokens.find((t) => t.token === token);
    if (!tokenRecord) return undefined;
    return this.findUserById(tokenRecord.user_id);
  }

  public revokeToken(token: string): boolean {
    const initialLen = this.schema.tokens.length;
    this.schema.tokens = this.schema.tokens.filter((t) => t.token !== token);
    if (this.schema.tokens.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Case Operations
  public checkUniqueCaseNumber(caseNumber: string, excludeId?: number): boolean {
    const normalized = caseNumber.trim().toUpperCase();
    const existing = this.schema.cases.find(
      (c) => c.case_number.toUpperCase() === normalized && c.id !== excludeId
    );
    return !existing;
  }

  public getCases(params: {
    page?: number;
    per_page?: number;
    search?: string;
    search_field?: 'all' | 'case_number' | 'surgeon_name' | 'patient_reference';
    status?: string;
    priority?: string;
    surgeon?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const perPage = Math.max(1, Number(params.per_page) || 10);
    const search = (params.search || '').trim().toLowerCase();
    const searchField = params.search_field || 'all';
    const statusFilter = (params.status || '').trim();
    const priorityFilter = (params.priority || '').trim();
    const surgeonFilter = (params.surgeon || '').trim().toLowerCase();
    const sortBy = params.sort_by || 'id';
    const sortDir = (params.sort_direction || 'desc').toLowerCase();

    // Stats are computed across all records
    const stats = {
      total: this.schema.cases.length,
      draft: this.schema.cases.filter((c) => c.status === 'Draft').length,
      planning: this.schema.cases.filter((c) => c.status === 'Planning').length,
      in_review: this.schema.cases.filter((c) => c.status === 'In Review').length,
      approved: this.schema.cases.filter((c) => c.status === 'Approved').length,
      completed: this.schema.cases.filter((c) => c.status === 'Completed').length,
      cancelled: this.schema.cases.filter((c) => c.status === 'Cancelled').length,
    };

    // Filter
    let filtered = this.schema.cases.filter((c) => {
      // Search by specific field or all fields
      if (search) {
        if (searchField === 'case_number') {
          if (!c.case_number.toLowerCase().includes(search)) return false;
        } else if (searchField === 'surgeon_name') {
          if (!c.surgeon_name.toLowerCase().includes(search)) return false;
        } else if (searchField === 'patient_reference') {
          if (!c.patient_reference.toLowerCase().includes(search)) return false;
        } else {
          // 'all'
          const matchesCaseNum = c.case_number.toLowerCase().includes(search);
          const matchesSurgeon = c.surgeon_name.toLowerCase().includes(search);
          const matchesPatient = c.patient_reference.toLowerCase().includes(search);
          const matchesImplant = c.implant_type.toLowerCase().includes(search);
          if (!matchesCaseNum && !matchesSurgeon && !matchesPatient && !matchesImplant) {
            return false;
          }
        }
      }

      // Filter by Status
      if (statusFilter && statusFilter !== 'All') {
        if (c.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Filter by Priority (Bonus task)
      if (priorityFilter && priorityFilter !== 'All') {
        if (c.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
          return false;
        }
      }

      // Filter by Surgeon
      if (surgeonFilter && surgeonFilter !== 'all') {
        if (!c.surgeon_name.toLowerCase().includes(surgeonFilter)) {
          return false;
        }
      }

      return true;
    });

    // Sort (Bonus task: column sorting)
    filtered.sort((a, b) => {
      let valA: string | number = (a[sortBy as keyof MedicalCase] ?? '') as string | number;
      let valB: string | number = (b[sortBy as keyof MedicalCase] ?? '') as string | number;

      if (sortBy === 'surgery_date') {
        valA = a.surgery_date ? new Date(a.surgery_date).getTime() : 0;
        valB = b.surgery_date ? new Date(b.surgery_date).getTime() : 0;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const pagedCases = filtered.slice(offset, offset + perPage);

    // Attach creator data
    const enrichedCases = pagedCases.map((c) => {
      const creator = this.findUserById(c.created_by);
      return {
        ...c,
        creator: creator
          ? {
              id: creator.id,
              name: creator.name,
              email: creator.email,
              role: creator.role,
            }
          : undefined,
      };
    });

    return {
      cases: enrichedCases,
      pagination: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: lastPage,
        from: total === 0 ? 0 : offset + 1,
        to: Math.min(offset + perPage, total),
      },
      stats,
    };
  }

  public getCaseById(id: number): MedicalCase | undefined {
    const found = this.schema.cases.find((c) => c.id === id);
    if (!found) return undefined;
    const creator = this.findUserById(found.created_by);
    return {
      ...found,
      creator: creator
        ? {
            id: creator.id,
            name: creator.name,
            email: creator.email,
            role: creator.role,
          }
        : undefined,
    };
  }

  public createCase(
    data: {
      case_number: string;
      patient_reference: string;
      surgeon_name: string;
      implant_type: string;
      status: CaseStatus;
      priority: CasePriority;
      surgery_date?: string | null;
      notes?: string;
      hospital_site?: string;
    },
    createdByUserId: number
  ): MedicalCase {
    const newId = this.schema.cases.length > 0 ? Math.max(...this.schema.cases.map((c) => c.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newCase: MedicalCase = {
      id: newId,
      case_number: data.case_number.trim(),
      patient_reference: data.patient_reference.trim(),
      surgeon_name: data.surgeon_name.trim(),
      implant_type: data.implant_type.trim(),
      status: data.status,
      priority: data.priority,
      surgery_date: data.surgery_date || null,
      created_by: createdByUserId,
      notes: data.notes || '',
      hospital_site: data.hospital_site || '',
      created_at: now,
      updated_at: now,
    };

    this.schema.cases.unshift(newCase);
    this.persist();

    return this.getCaseById(newId)!;
  }

  public updateCase(
    id: number,
    data: Partial<{
      case_number: string;
      patient_reference: string;
      surgeon_name: string;
      implant_type: string;
      status: CaseStatus;
      priority: CasePriority;
      surgery_date?: string | null;
      notes?: string;
      hospital_site?: string;
    }>
  ): MedicalCase | undefined {
    const idx = this.schema.cases.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const existing = this.schema.cases[idx];
    const now = new Date().toISOString();

    const updated: MedicalCase = {
      ...existing,
      ...(data.case_number !== undefined && { case_number: data.case_number.trim() }),
      ...(data.patient_reference !== undefined && { patient_reference: data.patient_reference.trim() }),
      ...(data.surgeon_name !== undefined && { surgeon_name: data.surgeon_name.trim() }),
      ...(data.implant_type !== undefined && { implant_type: data.implant_type.trim() }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.surgery_date !== undefined && { surgery_date: data.surgery_date || null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.hospital_site !== undefined && { hospital_site: data.hospital_site }),
      updated_at: now,
    };

    this.schema.cases[idx] = updated;
    this.persist();

    return this.getCaseById(id);
  }

  public deleteCase(id: number): boolean {
    const idx = this.schema.cases.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.schema.cases.splice(idx, 1);
    this.persist();
    return true;
  }
}

export const db = new DatabaseService();

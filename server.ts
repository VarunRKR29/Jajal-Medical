import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { CasePolicy } from './server/policy.js';
import { CaseFormRequest } from './server/validator.js';
import { User } from './server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.use(express.json());

// Extend Express Request type
interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

// Authentication Middleware simulating Laravel Sanctum token auth
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Unauthenticated.',
    });
  }

  const token = authHeader.substring(7).trim();
  const user = db.findUserByToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Unauthenticated or invalid token.',
    });
  }

  req.user = user;
  req.token = token;
  next();
};

/* ==========================================================================
   REST API Endpoints (as defined in Assignment Section 5)
   ========================================================================== */

// 1. POST /api/login - Get an API token
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(422).json({
      success: false,
      data: null,
      message: 'The given data was invalid.',
      errors: {
        ...(email ? {} : { email: ['The email field is required.'] }),
        ...(password ? {} : { password: ['The password field is required.'] }),
      },
    });
  }

  const user = db.findUserByEmail(String(email));
  if (!user || user.password_hash !== String(password)) {
    return res.status(422).json({
      success: false,
      data: null,
      message: 'Invalid email or password.',
      errors: {
        email: ['These credentials do not match our records.'],
      },
    });
  }

  const token = db.createToken(user.id);

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    },
    message: 'Login successful',
  });
});

// 2. POST /api/logout - Revoke the token
app.post('/api/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.token) {
    db.revokeToken(req.token);
  }
  return res.status(200).json({
    success: true,
    data: null,
    message: 'Token revoked successfully',
  });
});

// Current User Profile
app.get('/api/user', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    },
    message: 'User profile retrieved successfully',
  });
});

// 3. GET /api/cases - List cases (paginated, filtered, sorted)
app.get('/api/cases', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (!CasePolicy.viewAny(user)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'This action is unauthorized.',
    });
  }

  const { page, per_page, search, search_field, status, priority, surgeon, sort_by, sort_direction } = req.query;

  const result = db.getCases({
    page: page ? Number(page) : undefined,
    per_page: per_page ? Number(per_page) : undefined,
    search: search ? String(search) : undefined,
    search_field: search_field as 'all' | 'case_number' | 'surgeon_name' | 'patient_reference' | undefined,
    status: status ? String(status) : undefined,
    priority: priority ? String(priority) : undefined,
    surgeon: surgeon ? String(surgeon) : undefined,
    sort_by: sort_by ? String(sort_by) : undefined,
    sort_direction: sort_direction === 'asc' ? 'asc' : 'desc',
  });

  return res.status(200).json({
    success: true,
    data: result,
    message: 'Cases retrieved successfully',
  });
});

// 4. POST /api/cases - Create a case
app.post('/api/cases', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // Policy check: only Admin and Engineer can create
  if (!CasePolicy.create(user)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'This action is unauthorized. Only Admins and Engineers can create cases.',
    });
  }

  // Form Request Validation
  const validation = CaseFormRequest.validate(req.body || {});
  if (!validation.passes) {
    return res.status(422).json({
      success: false,
      data: null,
      message: 'The given data was invalid.',
      errors: validation.errors,
    });
  }

  const created = db.createCase(
    {
      case_number: req.body.case_number,
      patient_reference: req.body.patient_reference,
      surgeon_name: req.body.surgeon_name,
      implant_type: req.body.implant_type,
      status: req.body.status,
      priority: req.body.priority,
      surgery_date: req.body.surgery_date,
      notes: req.body.notes,
      hospital_site: req.body.hospital_site,
    },
    user.id
  );

  return res.status(201).json({
    success: true,
    data: created,
    message: 'Case created successfully',
  });
});

// 5. GET /api/cases/:id - Get one case
app.get('/api/cases/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const caseId = Number(req.params.id);
  if (isNaN(caseId)) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Case not found.',
    });
  }

  const caseItem = db.getCaseById(caseId);
  if (!caseItem) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Case not found.',
    });
  }

  if (!CasePolicy.view(req.user!, caseItem)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'This action is unauthorized.',
    });
  }

  return res.status(200).json({
    success: true,
    data: caseItem,
    message: 'Case retrieved successfully',
  });
});

// 6. PUT /api/cases/:id - Update a case
app.put('/api/cases/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const caseId = Number(req.params.id);
  if (isNaN(caseId)) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Case not found.',
    });
  }

  const caseItem = db.getCaseById(caseId);
  if (!caseItem) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Case not found.',
    });
  }

  // Policy check
  if (!CasePolicy.update(req.user!, caseItem)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'This action is unauthorized. Only Admins and Engineers can update cases.',
    });
  }

  // Form Request Validation with unique rule ignoring current case
  const validation = CaseFormRequest.validate(req.body || {}, caseId);
  if (!validation.passes) {
    return res.status(422).json({
      success: false,
      data: null,
      message: 'The given data was invalid.',
      errors: validation.errors,
    });
  }

  const updated = db.updateCase(caseId, {
    case_number: req.body.case_number,
    patient_reference: req.body.patient_reference,
    surgeon_name: req.body.surgeon_name,
    implant_type: req.body.implant_type,
    status: req.body.status,
    priority: req.body.priority,
    surgery_date: req.body.surgery_date,
    notes: req.body.notes,
    hospital_site: req.body.hospital_site,
  });

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Case updated successfully',
  });
});

// 7. DELETE /api/cases/:id - Delete a case (Admin only)
app.delete('/api/cases/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  // Server-side policy check: ONLY Admin can delete. Viewer and Engineer are blocked immediately (403)
  if (!CasePolicy.delete(req.user!)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'This action is unauthorized. Only Admins can delete cases.',
    });
  }

  const caseId = Number(req.params.id);
  if (isNaN(caseId)) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Case not found.',
    });
  }

  const caseItem = db.getCaseById(caseId);
  if (!caseItem) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Case not found.',
    });
  }

  db.deleteCase(caseId);

  return res.status(200).json({
    success: true,
    data: null,
    message: 'Case deleted successfully',
  });
});

// Reset Database endpoint (for demo / testing reset)
app.post('/api/reset-db', (_req: Request, res: Response) => {
  db.resetDatabase();
  return res.status(200).json({
    success: true,
    data: null,
    message: 'Database reset to initial 24 seed cases and default users.',
  });
});

// Bonus: Public Holiday API endpoint (Nager.Date public API with timeout & fallback)
app.get('/api/holidays', async (req: Request, res: Response) => {
  const year = req.query.year || '2026';
  const countryCode = req.query.country || 'US';

  // Fallback list of known standard medical surgery facility blackout/public holidays in 2026
  const fallbackHolidays = [
    { date: `${year}-01-01`, localName: "New Year's Day", name: "New Year's Day" },
    { date: `${year}-01-19`, localName: 'Martin Luther King, Jr. Day', name: 'Martin Luther King, Jr. Day' },
    { date: `${year}-02-16`, localName: "Washington's Birthday / Presidents' Day", name: "Presidents' Day" },
    { date: `${year}-05-25`, localName: 'Memorial Day', name: 'Memorial Day' },
    { date: `${year}-06-19`, localName: 'Juneteenth National Independence Day', name: 'Juneteenth' },
    { date: `${year}-07-03`, localName: 'Independence Day (Observed)', name: 'Independence Day' },
    { date: `${year}-09-07`, localName: 'Labor Day', name: 'Labor Day' },
    { date: `${year}-10-12`, localName: 'Columbus Day', name: 'Columbus Day' },
    { date: `${year}-11-11`, localName: 'Veterans Day', name: 'Veterans Day' },
    { date: `${year}-11-26`, localName: 'Thanksgiving Day', name: 'Thanksgiving Day' },
    { date: `${year}-12-25`, localName: 'Christmas Day', name: 'Christmas Day' },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s graceful timeout

    const nagerUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const response = await fetch(nagerUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        data,
        source: 'Nager.Date API',
        message: 'Public holidays fetched successfully',
      });
    }
  } catch (err) {
    // Graceful fallback if external API is unreachable or times out
    console.warn('Nager.Date API unreachable or timed out, returning fallback holidays:', err);
  }

  return res.status(200).json({
    success: true,
    data: fallbackHolidays,
    source: 'Medical Facility Standard Holiday Calendar (Fallback)',
    message: 'Public holidays loaded (fallback)',
  });
});

/* ==========================================================================
   Vite Dev Server Integration / Static Hosting
   ========================================================================== */

async function startServer() {
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MedCase Server running at http://localhost:${PORT}`);
  });
}

startServer();

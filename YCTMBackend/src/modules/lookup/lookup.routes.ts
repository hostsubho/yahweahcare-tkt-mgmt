// ============================================================
// Lookup routes — categories, priorities, statuses
// These are reference/seed tables; read-only, no auth required.
// ============================================================

import { Router } from 'express';
import { pool } from '../../db/pool';

const router = Router();

// GET /lookup/all — combined endpoint for the frontend create-ticket form
router.get('/all', async (_req, res, next) => {
  try {
    const [cats, pris] = await Promise.all([
      pool.query(`SELECT id, label, icon, sort_order FROM yc_tkt_mgmt.categories ORDER BY sort_order`),
      pool.query(`SELECT id, label, sla_hours, sort_order FROM yc_tkt_mgmt.priorities ORDER BY sort_order`),
    ]);
    // statuses table may have schema differences — query separately and degrade gracefully
    let statRows: Record<string, unknown>[] = [];
    try {
      const sr = await pool.query(`SELECT id, label, sort_order FROM yc_tkt_mgmt.statuses ORDER BY sort_order`);
      statRows = sr.rows;
    } catch { /* statuses table absent or missing columns — frontend uses built-in defaults */ }
    // Lookups change only when an admin reseeds the DB — cache aggressively.
    // s-maxage=3600 lets Vercel's edge cache serve this without hitting the DB.
    // stale-while-revalidate=86400 keeps serving stale data while refreshing in background.
    res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json({ categories: cats.rows, priorities: pris.rows, statuses: statRows });
  } catch (err) { next(err); }
});

// GET /lookup/categories
router.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, label, icon, sort_order FROM yc_tkt_mgmt.categories ORDER BY sort_order`
    );
    res.json({ categories: rows });
  } catch (err) { next(err); }
});

// GET /lookup/priorities
router.get('/priorities', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, label, sla_hours, sort_order FROM yc_tkt_mgmt.priorities ORDER BY sort_order`
    );
    res.json({ priorities: rows });
  } catch (err) { next(err); }
});

// GET /lookup/statuses
router.get('/statuses', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, label, sort_order, is_closed FROM yc_tkt_mgmt.statuses ORDER BY sort_order`
    );
    res.json({ statuses: rows });
  } catch (err) { next(err); }
});

export default router;

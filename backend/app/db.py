"""PostgreSQL connection pool via psycopg2 (sync, run in thread pool)."""

from __future__ import annotations

import logging
from typing import Any

import psycopg2
import psycopg2.extras
import psycopg2.pool

from app.config import get_settings

logger = logging.getLogger(__name__)

_pool: psycopg2.pool.ThreadedConnectionPool | None = None


def init_pool() -> None:
    """Create the global connection pool (called at startup)."""
    global _pool
    cfg = get_settings()
    if not cfg.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")

    _pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=cfg.DB_MIN_SIZE,
        maxconn=cfg.DB_MAX_SIZE,
        dsn=cfg.DATABASE_URL,
    )
    logger.info("Database connection pool opened (max=%d)", cfg.DB_MAX_SIZE)


def close_pool() -> None:
    """Close the pool on shutdown."""
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None
        logger.info("Database connection pool closed")


def _reset_pool() -> None:
    """Recreate pool after connection failures (e.g. idle timeout)."""
    global _pool
    logger.warning("Resetting database connection pool after failure")
    try:
        if _pool:
            _pool.closeall()
    except Exception:
        pass
    init_pool()


def query(sql: str, params: tuple | list | None = None) -> list[dict[str, Any]]:
    """Execute a read-only query, return list of dicts.

    Automatically retries once on connection failure (handles idle drops).
    """
    if _pool is None:
        raise RuntimeError("Pool not initialised – call init_pool() first")

    for attempt in range(2):
        conn = None
        try:
            conn = _pool.getconn()
            conn.autocommit = True
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, params)
                rows = cur.fetchall()
                return [dict(r) for r in rows]
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            logger.warning("DB query failed (attempt %d): %s", attempt + 1, e)
            if conn:
                try:
                    _pool.putconn(conn, close=True)
                except Exception:
                    pass
                conn = None
            if attempt == 0:
                _reset_pool()
                continue
            raise
        finally:
            if conn:
                try:
                    _pool.putconn(conn)
                except Exception:
                    pass


def query_one(sql: str, params: tuple | list | None = None) -> dict[str, Any] | None:
    """Execute a query expected to return a single row."""
    rows = query(sql, params)
    return rows[0] if rows else None

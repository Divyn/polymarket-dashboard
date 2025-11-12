import { NextResponse } from 'next/server';
import { getDb, areTablesEmpty, areAllTablesFilled, dbPath, checkpointDatabase } from '@/lib/db';
import { getInitialSyncStatus } from '@/lib/polling';
import { getBitqueryOAuthToken } from '@/lib/env';
import { existsSync } from 'fs';
import { resolve } from 'path';

export async function GET() {
  try {
    const db = getDb();
    
    // Force aggressive checkpoint on the same connection to ensure WAL writes are visible
    // TRUNCATE mode forces all WAL data to be written to main database file
    let checkpointStatus = 'unknown';
    try {
      const checkpointResult = db.pragma('wal_checkpoint(TRUNCATE)', { simple: true });
      checkpointStatus = checkpointResult === 0 ? 'success' : `failed_${checkpointResult}`;
      if (checkpointResult !== 0) {
        console.error(`[Debug] Checkpoint returned ${checkpointResult} (may have active transactions)`);
        // Try RESTART mode as fallback
        const restartResult = db.pragma('wal_checkpoint(RESTART)', { simple: true });
        if (restartResult === 0) {
          checkpointStatus = 'restart_success';
        }
      }
    } catch (error: any) {
      checkpointStatus = `error_${error.message}`;
      console.error('[Debug] Checkpoint error:', error.message);
    }
    
    // Get table counts
    const tokenRegCount = db.prepare('SELECT COUNT(*) as count FROM token_registered_events').get() as { count: number };
    const orderFilledCount = db.prepare('SELECT COUNT(*) as count FROM order_filled_events').get() as { count: number };
    const condPrepCount = db.prepare('SELECT COUNT(*) as count FROM condition_preparation_events').get() as { count: number };
    const questionInitCount = db.prepare('SELECT COUNT(*) as count FROM question_initialized_events').get() as { count: number };
    
    // Get sample data
    const sampleQuestion = db.prepare('SELECT * FROM question_initialized_events LIMIT 1').get();
    const sampleCondition = db.prepare('SELECT * FROM condition_preparation_events LIMIT 1').get();
    
    // Market query diagnostics
    const totalQuestions = db.prepare('SELECT COUNT(*) as c FROM question_initialized_events').get() as { c: number };
    const totalConditions = db.prepare('SELECT COUNT(*) as c FROM condition_preparation_events').get() as { c: number };
    const withDecoded = db.prepare(`
      SELECT COUNT(*) as c 
      FROM question_initialized_events 
      WHERE ancillary_data_decoded IS NOT NULL 
        AND ancillary_data_decoded != '' 
        AND ancillary_data_decoded != 'null'
    `).get() as { c: number };
    const withConditions = db.prepare(`
      SELECT COUNT(DISTINCT q.question_id) as c
      FROM question_initialized_events q
      INNER JOIN condition_preparation_events c ON q.question_id = c.question_id
      WHERE q.ancillary_data_decoded IS NOT NULL 
        AND q.ancillary_data_decoded != '' 
        AND q.ancillary_data_decoded != 'null'
    `).get() as { c: number };
    const marketsQueryResult = db.prepare(`
      SELECT DISTINCT
        q.question_id,
        q.ancillary_data_decoded,
        q.block_time as question_time,
        c.condition_id,
        c.outcome_slot_count,
        t.token0,
        t.token1
      FROM question_initialized_events q
      INNER JOIN condition_preparation_events c ON q.question_id = c.question_id
      LEFT JOIN token_registered_events t ON c.condition_id = t.condition_id
      WHERE q.ancillary_data_decoded IS NOT NULL
        AND q.ancillary_data_decoded != ''
        AND q.ancillary_data_decoded != 'null'
      ORDER BY q.block_time DESC
      LIMIT 500
    `).all();
    
    // Check OAuth token
    const oauthToken = getBitqueryOAuthToken();
    const hasToken = oauthToken && oauthToken.length > 0;
    
    // Get sync status
    const syncStatus = getInitialSyncStatus();
    const tablesEmpty = areTablesEmpty();
    const allTablesFilled = areAllTablesFilled();
    
    // Check if init was called
    const initCalled = typeof require !== 'undefined';
    
    return NextResponse.json({
      success: true,
      data: {
        database: {
          path: dbPath,
          exists: existsSync(dbPath) || existsSync(resolve(dbPath, '..')),
          volumeMounted: existsSync('/data'),
          checkpointStatus,
        },
        tables: {
          token_registered_events: tokenRegCount.count,
          order_filled_events: orderFilledCount.count,
          condition_preparation_events: condPrepCount.count,
          question_initialized_events: questionInitCount.count,
        },
        sync: {
          inProgress: syncStatus.inProgress,
          duration: syncStatus.duration,
          tablesEmpty,
          allTablesFilled,
          needsSync: tablesEmpty && !syncStatus.inProgress,
        },
        environment: {
          hasOAuthToken: hasToken,
          tokenLength: hasToken ? oauthToken.length : 0,
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
        },
        sample: {
          question: sampleQuestion || null,
          condition: sampleCondition || null,
        },
        markets: {
          totalQuestions: totalQuestions.c,
          totalConditions: totalConditions.c,
          withDecoded: withDecoded.c,
          withDecodedAndConditions: withConditions.c,
          marketsQueryCount: marketsQueryResult.length,
          sampleMarket: marketsQueryResult[0] || null,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

